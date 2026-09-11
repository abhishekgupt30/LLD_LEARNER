# AI usage

Gemini receives the problem, requirements, expected concepts, evaluation criteria, and student submission. The prompt requires structured JSON and explicitly allows multiple valid designs. Gemini is never called from a route.

Deterministic checks run first and inspect completeness, required sections, and concept mentions. Hybrid evaluation combines objective and subjective scores with recorded source metadata. Provider failures preserve the submission and are visible through evaluation status and retry APIs.
