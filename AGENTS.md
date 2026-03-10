# AGENTS.md

This repository uses a role-based multi-agent workflow for Codex.

## Global rules
- Follow `docs/PRD.md` as the source of truth.
- Preserve the core product principle: **track understanding, not just effort**.
- Optimize for:
  - start within 3 seconds
  - complete daily review within 5 minutes
  - minimal typing
  - encouraging AI feedback
- Avoid scope creep. Build the MVP first.
- When unsure, choose the simpler implementation that preserves the learning loop.

## Shared MVP scope
Build these flows first:
1. Dashboard
2. Daily Review
3. Explain -> Feedback -> Rewrite
4. Learning Streak
5. Understanding Growth Graph
6. Concept Mastery (basic)
7. Weekly Review

## Agent roles

### Chief Architect Agent
Responsibilities:
- Read `docs/PRD.md`
- Define system architecture
- Define module boundaries
- Define API contracts
- Resolve cross-agent conflicts
- Approve final integration plan

Deliverables:
- architecture document
- route map
- API contract
- integration checklist

### Frontend Agent
Responsibilities:
- Build the web UI in Next.js + React + TailwindCSS
- Focus on mobile-first UX
- Keep forms minimal and fast
- Implement reusable components

Owns:
- `frontend/`

Deliverables:
- screens for dashboard, daily review, progress, concept mastery, weekly review
- explain feedback UI
- onboarding UI (if included in sprint)

### Backend Agent
Responsibilities:
- Design and implement app backend
- Use Supabase/Postgres
- Implement persistence for users, study logs, streaks, mastery, analytics summaries
- Define secure server routes/actions

Owns:
- `backend/`
- `supabase/`
- `migrations/`

Deliverables:
- schema
- auth wiring
- CRUD and query services
- streak calculation logic

### AI Agent
Responsibilities:
- Build explanation evaluation and coaching logic
- Return structured JSON from the model
- Keep feedback supportive and actionable
- Detect concept misunderstanding and weak metacognition when possible

Owns:
- `ai/`
- AI service interfaces in backend as needed

Deliverables:
- prompt specs
- JSON schema for AI outputs
- evaluation logic
- fallback/error handling for malformed responses

### Data Agent
Responsibilities:
- Design event tracking and analytic models
- Support streak, growth graph, rewrite rate, completion rate
- Ensure metrics can be computed from stored data

Owns:
- analytics spec inside `docs/`
- event schema proposals

Deliverables:
- event taxonomy
- analytics definitions
- derived metrics plan

### QA Agent
Responsibilities:
- Validate core UX flows
- Test streak logic, persistence, AI response handling, and access control
- Create automated tests where practical

Owns:
- `tests/`

Deliverables:
- test plan
- integration tests
- edge case list

### Security Agent
Responsibilities:
- Review auth, API access, secrets handling, and student data safety
- Flag unsafe logging or overexposure of AI payloads

Deliverables:
- security review checklist
- patch recommendations

### Product Analyst Agent
Responsibilities:
- Translate product goals into measurable KPIs
- Validate that implementation supports retention and learning metrics
- Recommend instrumentation gaps

Deliverables:
- KPI spec
- retention analysis plan
- dashboard metric requirements

## Collaboration protocol
1. Chief Architect publishes architecture + contracts first.
2. Frontend, Backend, AI, and Data agents work in parallel.
3. QA reviews completed slices, not just final integration.
4. Security reviews before release.
5. Chief Architect merges outputs and resolves inconsistencies.

## Definition of done for MVP
- A student can sign in.
- A student can complete a Daily Review in under 5 minutes.
- A student can submit an explanation and receive structured AI feedback.
- The system supports rewrite flow.
- Streak updates correctly.
- Understanding graph shows progress over time.
- Basic concept mastery is visible.
- Weekly review is stored and viewable.
