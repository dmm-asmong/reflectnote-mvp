create unique index if not exists study_logs_user_id_review_date_idx
  on public.study_logs (user_id, review_date);

create unique index if not exists concepts_subject_name_idx
  on public.concepts (subject, name);

create unique index if not exists concept_mastery_user_id_concept_id_idx
  on public.concept_mastery (user_id, concept_id);

create unique index if not exists weekly_reviews_user_id_week_start_date_idx
  on public.weekly_reviews (user_id, week_start_date);

alter table public.study_logs
  drop constraint if exists study_logs_status_check;

alter table public.study_logs
  add constraint study_logs_status_check
  check (status in ('draft', 'submitted', 'evaluated', 'rewritten'));

alter table public.study_logs
  drop constraint if exists study_logs_ai_score_check;

alter table public.study_logs
  add constraint study_logs_ai_score_check
  check (ai_score is null or ai_score between 1 and 5);

alter table public.concept_mastery
  drop constraint if exists concept_mastery_score_check;

alter table public.concept_mastery
  add constraint concept_mastery_score_check
  check (score between 1 and 5);
