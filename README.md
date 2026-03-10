# ReflectNote Codex Project Template

This repository template is designed for Codex-driven MVP development of **ReflectNote**, an AI-powered learning journal web app for high school students.

## Goal
Build an MVP that helps students:
- review lessons in under 5 minutes
- explain concepts in their own words
- receive AI feedback
- rewrite explanations
- track learning streaks
- visualize understanding growth
- manage concept mastery

## Recommended workflow in Codex
1. Put the repository in your Codex workspace.
2. Make sure `AGENTS.md` is in the repo root.
3. Start with the architect prompt in `prompts/01-chief-architect.md`.
4. Then run the specialist prompts in parallel:
   - frontend
   - backend
   - ai
   - data
   - qa
   - security
5. Let the architect reconcile conflicts and integrate outputs.

## Suggested build order
1. Authentication
2. Daily Review flow
3. Explain -> Feedback -> Rewrite loop
4. Streak logic
5. Understanding graph
6. Concept mastery
7. Weekly review

## MVP stack
- Frontend: Next.js + React + TailwindCSS
- Backend: Supabase + PostgreSQL
- AI: OpenAI API

## Key product principle
This is **not** a study-time tracker.
This is a **concept understanding tracker**.

## Local setup
1. Fill [`frontend/.env.local`](C:/Users/ccamd/00_dev/학습성찰일지/frontend/.env.local) with real Supabase and OpenAI values.
2. Apply SQL migrations in order:
   - [`migrations/001_initial_schema.sql`](C:/Users/ccamd/00_dev/학습성찰일지/migrations/001_initial_schema.sql)
   - [`migrations/002_rls_policies.sql`](C:/Users/ccamd/00_dev/학습성찰일지/migrations/002_rls_policies.sql)
   - [`migrations/003_indexes_and_constraints.sql`](C:/Users/ccamd/00_dev/학습성찰일지/migrations/003_indexes_and_constraints.sql)
   - [`migrations/004_users_insert_policy.sql`](C:/Users/ccamd/00_dev/학습성찰일지/migrations/004_users_insert_policy.sql)
3. Start the app from [`frontend`](C:/Users/ccamd/00_dev/학습성찰일지/frontend) with `npm run dev`.
4. Open `http://127.0.0.1:3002` if port `3000` or `3001` is already in use.

## Required env vars
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `OPENAI_API_KEY`: OpenAI API key
- `REFLECTNOTE_DEFAULT_TIMEZONE`: default timezone, currently `Asia/Seoul`
