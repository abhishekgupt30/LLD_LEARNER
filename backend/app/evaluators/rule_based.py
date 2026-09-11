from app.domain.evaluation_result import EvaluationResult, Finding
from app.evaluators.base import Evaluator, submission_text
from app.models.problem import Problem
from app.models.submission import Submission


class RuleBasedEvaluator(Evaluator):
    async def evaluate(self, problem: Problem, submission: Submission) -> EvaluationResult:
        text = submission_text(submission).lower()
        issues: list[Finding] = []
        checks = [
            ("requirements", submission.section_0_requirements, "Describe functional and non-functional requirements and assumptions."),
            ("classes", submission.section_1_classes, "Name the main entities and their responsibilities."),
            ("relationships", submission.section_2_relationships, "Explain relationships between the entities."),
            ("abstraction", submission.section_3_abstractions, "Identify useful interfaces or abstractions."),
            ("extensibility", submission.section_6_extensibility, "Explain how a new requirement can be added."),
            ("edge_cases", submission.section_7_edge_cases, "Discuss edge cases and concurrency concerns."),
            ("tradeoffs", submission.section_8_tradeoffs, "Document trade-offs and deliberate simplifications."),
        ]
        passed = 0
        for category, value, suggestion in checks:
            if value and str(value).strip() not in ("{}", "[]", "None"):
                passed += 1
            else:
                issues.append({"source": "rule_based", "category": category, "severity": "warning", "issue": f"The {category} section is empty or missing.", "why": "This section is part of the structured evaluation contract.", "impact": "The evaluator has less evidence to assess the design.", "suggestion": suggestion, "alternative": "A concise section with explicit assumptions is acceptable."})
        concept_hits = [concept for concept in problem.expected_concepts if concept.lower() in text]
        if not text.strip():
            issues.append({"source": "rule_based", "category": "submission", "severity": "major", "issue": "The submission is empty.", "why": "There is no design evidence to evaluate.", "impact": "A meaningful score cannot be produced.", "suggestion": "Complete the required sections before submitting."})
        score = max(0, min(100, round((passed / len(checks)) * 70 + min(len(concept_hits), 5) * 6)))
        return {"score": score, "category_scores": {"requirements": min(20, passed * 3), "completeness": min(50, passed * 7), "concepts": min(30, len(concept_hits) * 6)}, "strengths": [f"Covered {passed} of {len(checks)} objective sections."] if passed else [], "issues": issues, "summary": "Deterministic checks found objective completeness signals; subjective design quality requires reasoning-based evaluation.", "sources": ["rule_based"], "metadata": {"matched_concepts": concept_hits}}
