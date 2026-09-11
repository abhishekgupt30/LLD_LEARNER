from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import EvaluationNotFound, EvaluationFailed
from app.domain.enums import AttemptStatus, EvaluationStatus, EvaluatorType
from app.evaluators.gemini import GeminiEvaluator
from app.evaluators.hybrid import HybridEvaluator
from app.evaluators.rule_based import RuleBasedEvaluator
from app.models.evaluation import Evaluation
from app.repositories.evaluation_repository import EvaluationRepository
from app.services.attempt_service import AttemptService
from app.services.problem_service import ProblemService
from app.repositories.problem_repository import ProblemRepository
from app.repositories.submission_repository import SubmissionRepository


class EvaluationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.evaluations = EvaluationRepository(session)

    def evaluator(self, evaluator_type: EvaluatorType):
        rule = RuleBasedEvaluator()
        gemini = GeminiEvaluator(self.session)
        return {EvaluatorType.RULE_BASED: rule, EvaluatorType.GEMINI: gemini, EvaluatorType.HYBRID: HybridEvaluator(rule, gemini)}[evaluator_type]

    async def get(self, attempt_id: UUID) -> Evaluation:
        evaluation = await self.evaluations.get_for_attempt(attempt_id)
        if not evaluation:
            raise EvaluationNotFound(f"Evaluation for attempt {attempt_id} was not found")
        return evaluation

    async def run(self, attempt_id: UUID, evaluator_type: EvaluatorType = EvaluatorType.HYBRID) -> Evaluation:
        attempt = await AttemptService(self.session).get(attempt_id)
        submission = await SubmissionRepository(self.session).get_for_attempt(attempt_id)
        problem = await ProblemRepository(self.session).get(attempt.problem_id)
        if not submission or not problem:
            raise EvaluationFailed("An attempt must have a submission and problem before evaluation")
        attempt.status = AttemptStatus.EVALUATING
        evaluation = await self.evaluations.get_for_attempt(attempt_id)
        if not evaluation:
            evaluation = Evaluation(attempt_id=attempt_id, evaluator_type=evaluator_type, status=EvaluationStatus.PENDING, result={})
            await self.evaluations.save(evaluation)
        evaluation.status = EvaluationStatus.EVALUATING
        await self.session.flush()
        try:
            result = await self.evaluator(evaluator_type).evaluate(problem, submission)
            result = self._normalize_result(result)
            evaluation.status = EvaluationStatus.COMPLETED
            evaluation.score = result.get("score")
            evaluation.result = result
            evaluation.completed_at = datetime.now(timezone.utc)
            attempt.status = AttemptStatus.COMPLETED
        except Exception as exc:
            evaluation.status = EvaluationStatus.FAILED
            evaluation.result = {"error": str(exc), "sources": ["evaluation_service"]}
            attempt.status = AttemptStatus.FAILED
            raise EvaluationFailed(str(exc)) from exc
        finally:
            await self.session.commit()
        return evaluation

    @staticmethod
    def _normalize_result(result: dict) -> dict:
        score = result.get("overall_score", result.get("score", 0))
        try: score = max(0, min(100, int(float(score))))
        except (TypeError, ValueError): score = 0
        result["score"] = score
        result["overall_score"] = score
        result.setdefault("summary", "Evaluation completed.")
        result.setdefault("dimensions", {})
        result.setdefault("strengths", [])
        result.setdefault("critical_issues", result.get("issues", []))
        result.setdefault("recommendations", [])
        result.setdefault("code_findings", [])
        result.setdefault("tradeoffs", [])
        return result
