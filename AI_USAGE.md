# AI Usage

## Purpose

LLD Lotion uses AI to provide contextual feedback on low-level design submissions. Gemini is used as a reasoning assistant for architecture, extensibility, code quality, concurrency, and interview trade-offs. It is not used for authentication, routing, persistence, or as the only source of truth for objective checks.

## What data is sent

For an evaluation, the backend sends Gemini:

- The selected problem statement.
- Requirements and assumptions.
- Expected concepts and evaluation criteria.
- The learner's structured 11-section submission.

The Gemini API key is server-side only. The frontend never receives or sends the provider key directly.

## Evaluation flow

1. The deterministic evaluator checks required sections, completeness, and expected concept mentions.
2. The Gemini evaluator receives the problem context and submission through a controlled prompt.
3. Gemini is asked to return structured JSON containing scores, dimensions, strengths, issues, recommendations, and trade-offs.
4. The backend normalizes the provider response before saving it.
5. The hybrid evaluator combines objective rule-based evidence with contextual Gemini reasoning.
6. The result stores its sources so the UI can distinguish AI feedback from deterministic feedback.

The default score weighting gives 40% to deterministic checks and 60% to Gemini reasoning. This keeps the report useful when the design is incomplete while allowing architectural judgment to carry more weight.

## Reliability and fallback behavior

Gemini calls are isolated in `backend/app/evaluators/gemini.py`. The evaluator supports a configured primary model and fallback model, retries transient provider failures, and enforces a daily call limit.

If Gemini is unavailable, rate-limited, or not configured:

- The learner's submission is preserved.
- Deterministic completeness and concept feedback is still returned.
- The result is marked with `gemini_unavailable` metadata.
- The frontend shows that AI reasoning was unavailable.
- The learner can retry the evaluation later.

The product never labels a rule-based fallback as Gemini-generated feedback.

## Transparency

Evaluation results include source metadata such as:

```json
{
  "sources": ["rule_based", "gemini"],
  "metadata": {
    "deterministic_score": 72,
    "gemini_score": 84
  }
}
```

Fallback results identify the unavailable provider explicitly. This allows learners and reviewers to understand how a score was produced.

## Limitations

AI feedback is advisory and should not be treated as an absolute correctness verdict. Multiple valid designs can satisfy the same requirements, so prompts explicitly allow alternative architectures. Gemini may still miss context, overvalue familiar patterns, or provide an imperfect trade-off. Deterministic checks are also intentionally limited: they measure evidence and completeness, not the full quality of an implementation.

Learners should use the report as a review aid and compare it with the original requirements, their own reasoning, and interviewer expectations.

## Development and testing

Tests do not require a live Gemini key. The provider integration is isolated behind the evaluator interface so deterministic tests remain repeatable. A real provider call is only made when `GEMINI_API_KEY` is configured and an evaluation is submitted.

Keep Gemini credentials in backend environment variables only. Do not place `GEMINI_API_KEY` in `frontend/.env`, committed source files, screenshots, or client-side code.
