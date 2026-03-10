create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  grade text,
  created_at timestamptz not null default now()
);

create table if not exists public.study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  review_date date not null,
  subject text not null,
  topic text not null,
  concepts text[] not null default '{}',
  explanation_initial text not null default '',
  explanation_rewritten text,
  questions text[] not null default '{}',
  wrong_problem_note text,
  wrong_answer_reasons text[] not null default '{}',
  next_review_note text,
  status text not null default 'draft',
  timezone text not null,
  ai_score smallint,
  ai_difficulty text,
  ai_feedback_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.concepts (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.concept_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  concept_id uuid not null references public.concepts (id) on delete cascade,
  score smallint not null default 1,
  last_reviewed_at timestamptz,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  week_start_date date not null,
  key_concepts text[] not null default '{}',
  hardest_concept text not null,
  common_error_pattern text not null,
  next_strategy text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
