# LLD Lotion — MVP Design Note

## 1. Product and MVP scope

LLD Lotion is an interview-practice workbench for engineers preparing for low-level design and machine-coding rounds. The MVP turns an open-ended design exercise into a repeatable workflow:

1. Select a realistic LLD problem.
2. Work through an 11-section design blueprint.
3. Save drafts while working.
4. Submit the completed design.
5. Receive deterministic completeness checks plus contextual LLM feedback.
6. Review the score, issues, fixes, trade-offs, and interview follow-up questions.

The MVP focuses on a single learner and a modular catalogue of problems. It does not attempt to provide live collaboration, billing, social features, or a production job queue. The goal is to validate whether structured practice and diagnostic feedback produce a better learning loop than passive design tutorials.

## 2. High-level architecture

The system is a modular monolith with a React/Vite frontend and a FastAPI backend backed by PostgreSQL.

```text
┌──────────────────────┐       HTTP/JSON        ┌─────────────────────────┐
│ React/Vite Frontend  │ ─────────────────────▶ │ FastAPI Backend         │
│                      │ ◀───────────────────── │                         │
│ Landing, auth,       │                        │ Routes → Services       │
│ library, workspace,  │                        │        → Repositories   │
│ evaluation, history  │                        │        → PostgreSQL      │
└──────────────────────┘                        │                         │
                                                │ Hybrid Evaluator        │
                                                │  ├─ Rule-based checks   │
                                                │  └─ Gemini reasoning    │
                                                └──────────┬──────────────┘
                                                           │
                                                   Gemini API (optional)
```

### Frontend

The frontend is organized around page-level workflows and small service clients:

- `LandingPage`: public product explanation and primary calls to action.
- `LoginPage`: authentication entry point.
- `DashboardPage`: learner progress and active work.
- `ProblemLibraryPage`: searchable/filterable problem catalogue.
- `ProblemWorkspacePage`: 11-section design editor and submission flow.
- `EvaluationPage`: asynchronous evaluation status and diagnostic report.
- `AttemptHistoryPage` and `ProfilePage`: progress review and learner settings.
- `services/api.ts`: authenticated HTTP client with configurable `VITE_API_BASE_URL`.

The frontend treats an evaluation as asynchronous. After submission it navigates to Evaluation Studio, polls the evaluation record while it is `PENDING` or `EVALUATING`, and then renders the completed or failed state.

### Backend

The backend follows a layered structure:

- `api/routes`: HTTP endpoints, authentication dependencies, and request handling.
- `schemas`: Pydantic request and response contracts.
- `services`: business workflows such as authentication, attempts, submissions, problems, and evaluations.
- `repositories`: database access isolated from business logic.
- `models`: SQLAlchemy persistence models.
- `evaluators`: rule-based, Gemini, and hybrid evaluator implementations.
- `domain`: shared enums and evaluation result contracts.
- `core`: configuration, database session management, and exceptions.

PostgreSQL is the source of truth. Alembic manages schema migrations, and the backend container runs migrations before starting the FastAPI application.

## 3. Primary user flow

### A. Discover and authenticate

The learner lands on the public page, understands the product value, and opens the workspace or problem library. Authentication creates or retrieves a learner account. Authenticated requests carry the JWT issued by the backend.

### B. Choose a problem

The problem library loads catalogue records from `GET /api/problems`. A problem contains a title, difficulty, description, expected concepts, patterns, and a suggested time target. The learner can filter by difficulty, status, and pattern.

### C. Start and work on an attempt

Selecting a problem creates an attempt through `POST /api/attempts`. The workspace presents the 11-section blueprint:

1. Requirements and assumptions
2. Core classes/entities
3. Relationships
4. Interfaces and abstractions
5. Design patterns
6. Explanation/design rationale
7. Extensibility
8. Edge cases and concurrency
9. Trade-offs
10. Diagram notes
11. Code/implementation sketch

Draft updates use `PUT /api/attempts/{id}/draft`. A learner may leave and resume an in-progress attempt without losing the current design.

### D. Submit and evaluate

Submission uses `POST /api/attempts/{id}/submit`. The backend persists the submission and schedules evaluation as a FastAPI background task. The API returns promptly while the evaluator works.

The frontend then polls `GET /api/attempts/{id}/evaluation`. During this stage, the UI shows an evaluation status and animated loading bar. This makes the asynchronous LLM wait explicit instead of making the learner assume the request is stuck.

### E. Review and improve

The completed report includes an overall score, rubric dimensions, strengths, critical issues, recommendations, code findings, trade-offs, and interview questions. A learner can retry evaluation when Gemini was unavailable, or create a new attempt while preserving the earlier submission and evaluation history.

## 4. Core classes and responsibilities

| Component | Responsibility |
|---|---|
| `User` | Stores learner identity, role, target track, and progress metadata. |
| `Problem` | Stores the practice prompt, difficulty, expected concepts, patterns, and time target. |
| `Attempt` | Represents one learner run for one problem and tracks lifecycle status. |
| `Submission` | Stores the structured 11-section learner response. Drafts can be updated; submitted work is retained for evaluation. |
| `Evaluation` | Stores evaluation status, score, evaluator type, normalized result, and completion time. |
| `LLMUsage` | Tracks daily Gemini calls and enforces the configured provider limit. |
| `AttemptService` | Creates, resumes, and transitions attempts. |
| `SubmissionService` | Saves drafts and creates submitted design records. |
| `EvaluationService` | Orchestrates evaluator selection, state transitions, normalization, persistence, and retry-safe execution. |
| `RuleBasedEvaluator` | Produces deterministic completeness and concept findings. |
| `GeminiEvaluator` | Calls Gemini with the problem and submission, then normalizes provider output. |
| `HybridEvaluator` | Combines objective rule-based signals with Gemini reasoning and records their sources. |
| `ApiClient` | Adds the JWT, sends JSON requests, and handles backend/API fallback URLs. |

The evaluator abstraction is the main extension point. A future evaluator can implement the same interface and be registered without changing routes, persistence, or frontend contracts.

## 5. Evaluation design

The default evaluator is `HYBRID`.

### Deterministic layer

The rule-based evaluator checks whether required sections contain meaningful content and whether expected problem concepts appear in the submission. It provides transparent signals such as section coverage, matched concepts, and missing evidence. These checks are reproducible and do not require a provider key.

### LLM layer

The Gemini evaluator receives the problem context and structured submission through a controlled prompt. It returns JSON containing dimensions, score, summary, findings, recommendations, and trade-offs. The response is normalized before it is stored so malformed or incomplete provider fields do not break the API contract.

### Combined result

The hybrid result combines the deterministic score and Gemini score, with the LLM contributing the larger share because architectural reasoning is the harder-to-automate part. Every result records its sources. If Gemini is unavailable or the daily limit is reached, the system returns deterministic feedback and marks the result with `gemini_unavailable` rather than presenting fallback output as AI reasoning.

## 6. Data and API boundaries

Important API boundaries include:

- `POST /api/users` — create or authenticate a learner.
- `GET /api/problems` — load the problem catalogue.
- `POST /api/attempts` — create an attempt.
- `GET /api/attempts/{id}` — retrieve attempt state.
- `PUT /api/attempts/{id}/draft` — save a draft.
- `POST /api/attempts/{id}/submit` — submit and trigger evaluation.
- `GET /api/attempts/{id}/evaluation` — retrieve evaluation state/result.
- `POST /api/attempts/{id}/evaluation/retry` — retry an evaluation.
- `GET /health` and `GET /health/db` — process and database health checks.

The backend owns validation and authorization. The frontend is responsible for presentation, polling, and user feedback, but never treats a client-side score estimate as the authoritative evaluation.

## 7. Trade-offs and deliberate decisions

### Modular monolith instead of microservices

The MVP has one transactional domain and a small team surface area. A modular monolith keeps deployment, local development, and debugging simple while preserving boundaries through services, repositories, and evaluator interfaces. A separate worker or evaluator service can be introduced later if evaluation volume requires it.

### FastAPI background tasks instead of a queue

Background tasks provide a simple asynchronous user experience without adding Redis or a worker infrastructure dependency. The trade-off is that work is tied to the application process and is less durable across restarts. The evaluator service method is isolated so it can later be moved to a durable worker with the same API contract.

### PostgreSQL instead of client-side state

Attempts, submissions, and evaluations need reliable history and relationships. PostgreSQL provides transactions, constraints, and queryable progress data. The trade-off is that local setup requires a database, which is handled through Docker Compose for development.

### Hybrid evaluation instead of LLM-only evaluation

LLMs are useful for nuanced reasoning but can be inconsistent and are not ideal for basic completeness checks. Deterministic checks improve transparency and resilience; Gemini adds architectural interpretation. The trade-off is a more complex result model and the need to explain when AI feedback is unavailable.

### Structured blueprint instead of a blank editor

The blueprint reduces learner uncertainty and produces better evaluation evidence. It may feel restrictive to experienced users, but it creates a repeatable interview process and makes progress measurable. The sections remain text-oriented so the learner can still express different design styles.

### Provider key stays server-side

Gemini credentials are read only by the backend. The frontend receives evaluation results, never the provider key. This protects the credential and allows rate limiting, retries, and source attribution to remain under server control.

## 8. Future extensions

The architecture leaves room for:

- Durable evaluation workers and retry queues.
- More language-aware AST and concurrency checks.
- Comparison between attempts and learner-specific weakness trends.
- Additional LLM providers behind the evaluator interface.
- Interviewer follow-up simulation and timed voice/conversation practice.
- Team or mentor review workflows.

These are intentionally outside the MVP so the first release can validate the core loop: structured design practice, credible feedback, and measurable improvement.
