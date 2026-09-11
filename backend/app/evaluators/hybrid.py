from app.evaluators.base import Evaluator
from app.core.exceptions import EvaluationFailed, LLMRateLimitExceeded


class HybridEvaluator(Evaluator):
    def __init__(self, rule_based: Evaluator, gemini: Evaluator) -> None:
        self.rule_based = rule_based
        self.gemini = gemini

    async def evaluate(self, problem, submission):
        deterministic = await self.rule_based.evaluate(problem, submission)
        try:
            ai = await self.gemini.evaluate(problem, submission)
        except LLMRateLimitExceeded as exc:
            deterministic["summary"] += f" AI reasoning was unavailable: {exc}."
            deterministic["metadata"]["gemini_unavailable"] = True
            deterministic["metadata"]["gemini_limit_reached"] = True
            deterministic["metadata"]["gemini_unavailable_reason"] = str(exc)
            return deterministic
        except EvaluationFailed as exc:
            deterministic["summary"] += f" AI reasoning was unavailable: {exc}."
            deterministic["metadata"]["gemini_unavailable"] = True
            deterministic["metadata"]["gemini_unavailable_reason"] = str(exc)
            return deterministic
        rule_issues = deterministic.get("issues", [])
        # Gemini's public contract calls these critical_issues; accept issues as
        # well so older/provider responses remain compatible with the UI.
        ai_issues = ai.get("critical_issues") or ai.get("issues") or []
        ai_issues = [{**issue, "source": "gemini"} for issue in ai_issues]
        return {
            **ai,
            "score": round((deterministic["score"] * 0.4) + (ai.get("score", ai.get("overall_score", 0)) * 0.6)),
            "issues": rule_issues + ai_issues,
            "critical_issues": ai_issues,
            "sources": ["rule_based", "gemini"],
            "metadata": {"deterministic_score": deterministic["score"], "gemini_score": ai.get("score", ai.get("overall_score"))},
        }
