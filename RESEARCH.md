# Research Note

## Learner problem

LLD interview preparation is fragmented. Learners study patterns and watch solutions, but often lack a repeatable process for clarifying requirements, defining responsibilities, choosing abstractions, reasoning about concurrency, and defending trade-offs within a 45–60 minute interview. Existing feedback is commonly subjective or limited to whether code runs.

## Existing approaches

- Coding platforms provide problem libraries and correctness checks, but focus mainly on algorithms and runtime rather than object design.
- Courses and design resources provide frameworks and examples, but practice is often passive or answer-led.
- Mock interviews add time pressure and conversation, but feedback varies by interviewer and is hard to compare across attempts.
- Diagramming and static-analysis tools help with structure, but are disconnected from the interview rubric and learning plan.
- General LLM assistants provide flexible critique, but need a fixed rubric and deterministic checks to avoid inconsistent or overly agreeable feedback.

## Key gaps

The main gaps are the absence of one integrated LLD rehearsal environment, separation between objective and subjective feedback, actionable issue-to-fix diagnostics, and progress tracking across repeated attempts.

## Product direction

LLD Lotion addresses these gaps with an 11-section blueprint, realistic problems, draft persistence, and a hybrid evaluator. Deterministic checks assess completeness and expected concepts; Gemini reasons about architecture, extensibility, code quality, concurrency, and trade-offs. Results record their sources and clearly identify fallback feedback when AI is unavailable.

The MVP should remain focused on high-quality Staff-level machine-coding practice. Future work can add richer AST checks, attempt comparisons, durable evaluation workers, and interviewer-style follow-up simulations.
