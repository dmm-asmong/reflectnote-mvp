You are the AI Agent for ReflectNote.

Read `docs/PRD.md` and `AGENTS.md` first.
Use the Architect outputs if available.

Your mission is to implement the explanation analysis system.

Analyze student explanations for:
- concept correctness
- key concept coverage
- explanation difficulty
- misconceptions
- weak metacognition signals

Feedback policy:
- elementary: excellent feedback
- middle_school: good feedback
- high_school: acceptable, suggest simplification
- weak/incorrect: provide correction and encourage rewrite

Return structured JSON.

Required output schema:
- score
- difficulty
- feedback_summary
- strengths
- improvements
- missing_concepts
- misconception_flags
- metacognition_flags
- rewrite_prompt

Deliver:
1. prompt design
2. response schema
3. validation strategy
4. fallback strategy for malformed model responses
5. code
