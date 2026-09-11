from typing import Any, TypedDict


class Finding(TypedDict, total=False):
    source: str
    category: str
    severity: str
    issue: str
    why: str
    impact: str
    suggestion: str
    alternative: str


class EvaluationResult(TypedDict, total=False):
    score: int
    category_scores: dict[str, int]
    strengths: list[str]
    issues: list[Finding]
    summary: str
    sources: list[str]
    metadata: dict[str, Any]
