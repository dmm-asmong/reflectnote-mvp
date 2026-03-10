You are coordinating a multi-agent build for ReflectNote.

Execution order:
1. Read `docs/PRD.md`
2. Read `AGENTS.md`
3. Run the Chief Architect prompt first
4. Then run Frontend, Backend, AI, and Data prompts in parallel
5. Run QA and Security reviews on the resulting implementation
6. Reconcile issues and integrate into a working MVP

Build only the MVP defined in the PRD.
Prefer simple architecture and low-friction UX.
