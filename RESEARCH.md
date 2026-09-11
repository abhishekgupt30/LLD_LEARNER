# Research Note: LLD Practice & Evaluation Platform

## 1. Learner problem

Low-level design (LLD) interview preparation is difficult because learners are expected to demonstrate several skills at the same time: clarify requirements, identify domain entities, define interfaces, choose patterns, reason about extensibility, and discuss concurrency and trade-offs. Most learners can study individual concepts, but struggle to turn them into a repeatable 45–60 minute interview workflow.

The main pain points are:

- **Unstructured practice.** Learners repeatedly solve familiar examples such as parking lots or elevators, but do not have a consistent sequence for moving from requirements to code.
- **Weak feedback loops.** A solution may compile and look reasonable while still containing tight coupling, poor abstraction boundaries, unsafe shared state, or an inappropriate pattern choice.
- **Subjective evaluation.** Existing feedback often says that a design is “not scalable” or “not extensible” without identifying the exact class, responsibility, invariant, or trade-off behind that judgment.
- **Limited interview realism.** Tutorials optimize for explanation and reference solutions; they rarely reproduce the time pressure, incomplete requirements, review conversation, and follow-up questions of an actual interview.
- **Disconnected learning tools.** Notes, UML diagrams, code editors, online judges, and AI chat sessions are typically separate. Learners must assemble the process themselves and lose the reasoning trail between attempts.

The result is a preparation gap: learners consume a lot of design content but cannot reliably produce, explain, and improve a design under interview conditions.

## 2. Existing approaches and tools reviewed

Several categories of tools address parts of the problem:

### Coding practice platforms

Platforms such as LeetCode and HackerRank provide large problem libraries, submissions, progress tracking, and automated correctness checks. They are effective for algorithmic practice and measurable repetition. Their primary feedback signal, however, is usually correctness, runtime, and memory usage. Those signals do not adequately assess object responsibilities, interface design, dependency direction, or concurrency decisions in an LLD solution.

### System-design and interview-preparation courses

Structured courses and guided resources, including system-design and object-oriented design curricula, provide useful frameworks, pattern explanations, and worked examples. They improve vocabulary and conceptual understanding, but practice is often passive or answer-led. Learners are not always required to create a complete design first and defend the decisions they made.

### Interview-practice communities and mock interviews

Mock-interview services and peer-practice communities provide time pressure and conversational realism. Their quality depends heavily on the interviewer, and feedback is difficult to standardize or compare across sessions. A learner may receive valuable advice but lack a durable, structured record of recurring weaknesses.

### UML, diagramming, and code-quality tools

Diagramming tools and static-analysis systems help visualize structure or detect certain code-level problems. They are useful components, but generally do not connect the diagram, written design rationale, interview rubric, and targeted learning plan in one workflow.

### General-purpose LLM assistants

LLM chat tools can critique designs, generate alternatives, and explain patterns quickly. They are flexible but can be inconsistent, overly agreeable, or insufficiently grounded in the exact submission. Without a fixed rubric, explicit source attribution, and deterministic checks, learners may not know which feedback is objective and which is model judgment.

## 3. Key gaps

The research indicates four important gaps:

1. **No integrated LLD rehearsal environment:** the learner needs one place for the prompt, blueprint, design notes, code, evaluation, and history.
2. **No separation between objective and subjective feedback:** static checks and architectural reasoning should be visible as different evidence sources.
3. **No actionable diagnostic format:** feedback should connect issue → root cause → production impact → concrete fix → interview trade-off.
4. **No progression model:** repeated attempts should reveal whether a learner is improving in completeness, abstraction, extensibility, code quality, and concurrency reasoning.

## 4. Product direction

LLD Lotion is positioned as an interview rehearsal workbench rather than another problem list or chat assistant. The core experience is an 11-section blueprint that guides the learner from requirements and entities through interfaces, patterns, concurrency, trade-offs, and tests. Each attempt is saved so the learner can revisit decisions and compare progress.

The evaluation direction is deliberately hybrid:

- **Deterministic evaluation** checks completeness, expected concepts, required sections, and other objective signals.
- **LLM evaluation** provides contextual reasoning about architecture, extensibility, code quality, and trade-offs.
- **Source-aware results** clearly record whether feedback came from rule-based checks, Gemini reasoning, or both. If the LLM is unavailable, the product returns transparent deterministic feedback instead of pretending that AI reasoning occurred.

The first product focus should remain narrow: high-quality LLD practice for Staff-level machine-coding interviews. The next priorities are richer problem rubrics, better comparison across attempts, explicit concurrency test scenarios, and feedback that can be acted on within the next practice session. Longer term, the same evaluator contract can support additional models, languages, and interviewer-style follow-up simulations without changing the core learner workflow.

## Research conclusion

The opportunity is not simply to add AI feedback to an existing coding platform. It is to make LLD practice structured, observable, and repeatable: guide the design process, verify objective properties, explain architectural weaknesses, and turn every attempt into a measurable learning loop.
