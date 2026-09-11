from abc import ABC, abstractmethod
from typing import Any

from app.domain.evaluation_result import EvaluationResult
from app.models.problem import Problem
from app.models.submission import Submission


class Evaluator(ABC):
    @abstractmethod
    async def evaluate(self, problem: Problem, submission: Submission) -> EvaluationResult:
        raise NotImplementedError


def submission_text(submission: Submission) -> str:
    values: list[Any] = [getattr(submission, f"section_{index}_{name}") for index, name in enumerate(("requirements", "classes", "relationships", "abstractions", "patterns", "explanation", "extensibility", "edge_cases", "tradeoffs", "diagram", "code"))]
    return " ".join(str(value) for value in values if value)
