create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, grade)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'grade'
  )
  on conflict (id) do update
  set email = excluded.email,
      grade = excluded.grade;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_auth_user_created();

alter table public.users enable row level security;
alter table public.study_logs enable row level security;
alter table public.concepts enable row level security;
alter table public.concept_mastery enable row level security;
alter table public.weekly_reviews enable row level security;

create policy "users_select_own"
on public.users
for select
using (auth.uid() = id);

create policy "users_update_own"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "study_logs_all_own"
on public.study_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "concept_mastery_all_own"
on public.concept_mastery
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "weekly_reviews_all_own"
on public.weekly_reviews
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "concepts_read_authenticated"
on public.concepts
for select
using (auth.role() = 'authenticated');
