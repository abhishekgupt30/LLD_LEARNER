# Design

This is a modular monolith because the product has one transactional domain and does not yet need independently deployed components. PostgreSQL is the source of truth. Attempts own immutable submissions and one replaceable evaluation record; retry changes evaluation state but never deletes the submission.

The service layer depends on the `Evaluator` abstraction. Adding another LLM evaluator only requires implementing that interface and registering it in the evaluation service. The hybrid evaluator keeps objective findings separate from subjective findings and records their sources.

Evaluation runs as a FastAPI background task for the MVP. A later worker can call the same `EvaluationService.run` workflow without changing API contracts.
