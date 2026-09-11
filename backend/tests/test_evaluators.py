import pytest

from app.evaluators.rule_based import RuleBasedEvaluator
from app.evaluators.prompts import build_gemini_prompt
from app.models.problem import Problem
from app.models.submission import Submission


@pytest.mark.asyncio
async def test_rule_based_evaluator_reports_missing_sections():
    result = await RuleBasedEvaluator().evaluate(Problem(title="Test", difficulty="BEGINNER", description="x", sample_scenario="x", requirements=["r"], expected_concepts=["Thing"], constraints=[], hints=[], prerequisites=[], evaluation_criteria={}), Submission(section_0_requirements={}, section_1_classes={}, section_2_relationships={}, section_3_abstractions={}, section_4_patterns={}, section_5_explanation="", section_6_extensibility={}, section_7_edge_cases={}, section_8_tradeoffs={}, section_9_diagram="", section_10_code=""))
    assert result["score"] == 0
    assert result["issues"]


def test_prompt_contains_problem_specific_rubric():
    problem = Problem(title="Rate Limiter", difficulty="Medium", description="rate", sample_scenario="sample", requirements=["thread safe"], expected_concepts=["Strategy"], constraints=["low latency"], hints=[], prerequisites=[], evaluation_criteria=["Thread safety"])
    submission = Submission(section_0_requirements={}, section_1_classes={}, section_2_relationships={}, section_3_abstractions={}, section_4_patterns={}, section_5_explanation="", section_6_extensibility={}, section_7_edge_cases={}, section_8_tradeoffs={}, section_9_diagram="", section_10_code="")
    prompt = build_gemini_prompt(problem, submission)
    assert "Thread safety" in prompt
    assert "rate" in prompt
