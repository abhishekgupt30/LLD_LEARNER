from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import InvalidAttemptState, InvalidSubmission, SubmissionAlreadyExists
from app.domain.enums import AttemptStatus
from app.domain.enums import EvaluationStatus, EvaluatorType
from app.models.evaluation import Evaluation
from app.models.submission import Submission
from app.repositories.submission_repository import SubmissionRepository
from app.services.attempt_service import AttemptService


class SubmissionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.submissions = SubmissionRepository(session)
        self.attempts = AttemptService(session)

    async def get(self, attempt_id: UUID) -> Submission | None:
        return await self.submissions.get_for_attempt(attempt_id)

    async def submit(self, attempt_id: UUID, payload: dict) -> Submission:
        attempt = await self.attempts.get(attempt_id)
        if attempt.status != AttemptStatus.IN_PROGRESS:
            raise InvalidAttemptState("Only an IN_PROGRESS attempt can be submitted")
        submission = await self.submissions.get_for_attempt(attempt_id)
        if not any(value for value in payload.values()) and not submission:
            raise InvalidSubmission("Submission must contain at least one non-empty section")
        if submission:
            for key, value in payload.items(): setattr(submission, key, value)
        else:
            submission = Submission(attempt_id=attempt_id, **payload)
            await self.submissions.create(submission)
        attempt.status = AttemptStatus.SUBMITTED
        from datetime import datetime, timezone
        attempt.submitted_at = datetime.now(timezone.utc)
        self.session.add(Evaluation(attempt_id=attempt_id, status=EvaluationStatus.PENDING, evaluator_type=EvaluatorType.HYBRID, result={}))
        return submission

    async def save_draft(self, attempt_id: UUID, payload: dict) -> Submission:
        attempt = await self.attempts.get(attempt_id)
        if attempt.status != AttemptStatus.IN_PROGRESS:
            raise InvalidAttemptState("Only an IN_PROGRESS attempt can be edited")
        submission = await self.submissions.get_for_attempt(attempt_id)
        if submission:
            for key, value in payload.items():
                setattr(submission, key, value)
            await self.session.flush()
            return submission
        submission = Submission(attempt_id=attempt_id, **payload)
        await self.submissions.create(submission)
        return submission
