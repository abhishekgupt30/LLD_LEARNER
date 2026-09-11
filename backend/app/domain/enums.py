from enum import StrEnum


class AttemptStatus(StrEnum):
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    EVALUATING = "EVALUATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class EvaluatorType(StrEnum):
    RULE_BASED = "RULE_BASED"
    GEMINI = "GEMINI"
    HYBRID = "HYBRID"


class EvaluationStatus(StrEnum):
    PENDING = "PENDING"
    EVALUATING = "EVALUATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
