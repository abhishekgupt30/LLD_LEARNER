import json
import asyncio
from datetime import date

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import EvaluationFailed, LLMRateLimitExceeded
from app.evaluators.base import Evaluator
from app.evaluators.prompts import build_gemini_prompt
from app.models.llm_usage import LLMUsage


def _text(value, fallback: str = "") -> str:
    return value.strip() if isinstance(value, str) else fallback


def normalize_gemini_result(result: dict) -> dict:
    """Keep provider output predictable for the API and evaluation UI."""
    result = result if isinstance(result, dict) else {}
    dimensions = result.get("dimensions") if isinstance(result.get("dimensions"), dict) else {}
    normalized_dimensions = {}
    for name in ("architecture", "extensibility", "concurrency", "code_quality"):
        value = dimensions.get(name, {})
        if isinstance(value, (int, float)):
            value = {"score": value}
        if not isinstance(value, dict):
            value = {}
        score = value.get("score", 0)
        try:
            score = max(0, min(100, int(float(score))))
        except (TypeError, ValueError):
            score = 0
        normalized_dimensions[name] = {
            "score": score,
            "rating": _text(value.get("rating"), "NEEDS_WORK"),
            "feedback": _text(value.get("feedback"), "No dimension-specific feedback was returned."),
        }
    issues = result.get("critical_issues") or result.get("issues") or []
    normalized_issues = []
    for issue in issues if isinstance(issues, list) else []:
        if not isinstance(issue, dict):
            continue
        normalized_issues.append({
            "category": _text(issue.get("category"), "architecture"),
            "severity": _text(issue.get("severity"), "MEDIUM").upper(),
            "title": _text(issue.get("title"), "Review finding"),
            "specific_issue": _text(issue.get("specific_issue") or issue.get("issue"), "The design needs more explicit reasoning."),
            "root_cause": _text(issue.get("root_cause") or issue.get("why"), "The submission does not establish the required invariant clearly."),
            "impact": _text(issue.get("impact"), "This can reduce correctness, reliability, or maintainability."),
            "primary_fix": _text(issue.get("primary_fix") or issue.get("suggestion"), "State the invariant and show the responsible abstraction."),
            "staff_tradeoff": _text(issue.get("staff_tradeoff") or issue.get("alternative"), "Choose the simplest design that satisfies the stated requirement."),
            "file_path": _text(issue.get("file_path")),
            "diff": _text(issue.get("diff")),
        })
    result["dimensions"] = normalized_dimensions
    raw_score = result.get("overall_score", result.get("score", 0))
    try:
        score = max(0, min(100, int(float(raw_score))))
    except (TypeError, ValueError):
        score = round(sum(item["score"] for item in normalized_dimensions.values()) / len(normalized_dimensions))
    result["overall_score"] = score
    result["score"] = score
    result["critical_issues"] = normalized_issues
    result["issues"] = normalized_issues
    result["summary"] = _text(result.get("summary"), "The submission was evaluated against the supplied problem rubric.")
    result.setdefault("requirements_coverage", [])
    result.setdefault("strengths", [])
    result.setdefault("recommendations", [])
    result.setdefault("code_findings", [])
    result.setdefault("tradeoffs", [])
    result.setdefault("interview_questions", [])
    result.setdefault("learning_plan", [])
    return result


class GeminiEvaluator(Evaluator):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def reserve_daily_call(self) -> None:
        """Atomically reserve one daily Gemini provider request."""
        limit = get_settings().gemini_daily_limit
        statement = (
            insert(LLMUsage)
            .values(usage_date=date.today(), calls=1)
            .on_conflict_do_update(
                index_elements=[LLMUsage.usage_date],
                set_={"calls": LLMUsage.calls + 1},
                where=LLMUsage.calls < limit,
            )
            .returning(LLMUsage.calls)
        )
        calls = await self.session.scalar(statement)
        if calls is None or calls > limit:
            raise LLMRateLimitExceeded(f"Daily Gemini API request limit of {limit} has been reached")
        await self.session.flush()

    async def evaluate(self, problem, submission):
        settings = get_settings()
        if not getattr(settings, "gemini_api_key", None):
            raise EvaluationFailed("Gemini API key is not configured")
        try:
            from google import genai
            client = genai.Client(api_key=settings.gemini_api_key)
            last_error = None
            response = None
            models = [settings.gemini_model]
            if settings.gemini_fallback_model and settings.gemini_fallback_model not in models:
                models.append(settings.gemini_fallback_model)
            for model_index, model in enumerate(models):
                for attempt in range(3):
                    try:
                        # Count every provider request, including retries and
                        # fallback-model requests, against the daily quota.
                        await self.reserve_daily_call()
                        response = await client.aio.models.generate_content(model=model, contents=build_gemini_prompt(problem, submission), config={"response_mime_type": "application/json"})
                        break
                    except Exception as exc:
                        last_error = exc
                        message = str(exc).upper()
                        transient = any(marker in message for marker in ("503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED", "500", "INTERNAL"))
                        if not transient:
                            raise
                        if attempt < 2:
                            await asyncio.sleep(2 ** attempt)
                if response is not None:
                    break
                # A temporary capacity failure on the primary model should
                # not force deterministic-only feedback when a fallback is
                # configured.
                if model_index == len(models) - 1:
                    raise last_error or RuntimeError("Gemini request failed")
            result = normalize_gemini_result(json.loads(response.text))
            result["sources"] = ["gemini"]
            return result
        except LLMRateLimitExceeded:
            raise
        except Exception as exc:
            raise EvaluationFailed(f"Gemini evaluation failed: {exc}") from exc
