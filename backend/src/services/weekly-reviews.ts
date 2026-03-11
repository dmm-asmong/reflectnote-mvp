import { ensureUserProfile } from "./users";

import type { WeeklyReviewInput, WeeklyReviewSummary } from "../types/review";
import type { AppSupabaseClient } from "../types/supabase";

type WeeklyReviewRow = {
  id: string;
  user_id: string;
  week_start_date: string;
  key_concepts: string[] | null;
  hardest_concept: string;
  common_error_pattern: string;
  next_strategy: string;
};

function getCurrentWeekStartDate(now = new Date()) {
  const date = new Date(now);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);

  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(weekStartDate: string) {
  return `${weekStartDate} 주간 회고`;
}

async function getRecentConcepts(supabase: AppSupabaseClient, userId: string, weekStartDate: string): Promise<string[]> {
  const { data } = await supabase
    .from("study_logs")
    .select("concepts")
    .eq("user_id", userId)
    .gte("review_date", weekStartDate)
    .not("concepts", "is", null);

  if (!data) return [];

  const seen = new Set<string>();
  const result: string[] = [];
  for (const row of data) {
    for (const concept of (row.concepts as string[] | null) ?? []) {
      if (concept && !seen.has(concept)) {
        seen.add(concept);
        result.push(concept);
      }
    }
  }
  return result.slice(0, 8);
}

function createDefaultWeeklyReview(userId: string, recentConcepts: string[]): WeeklyReviewSummary {
  const weekStartDate = getCurrentWeekStartDate();

  return {
    id: `weekly-${weekStartDate}`,
    userId,
    weekLabel: formatWeekLabel(weekStartDate),
    keyConcepts: [],
    hardestConcept: "",
    commonErrorPattern: "",
    nextStrategy: "",
    recentConcepts,
  };
}

function mapWeeklyReviewRow(row: WeeklyReviewRow, recentConcepts: string[]): WeeklyReviewSummary {
  return {
    id: row.id,
    userId: row.user_id,
    weekLabel: formatWeekLabel(row.week_start_date),
    keyConcepts: row.key_concepts ?? [],
    hardestConcept: row.hardest_concept,
    commonErrorPattern: row.common_error_pattern,
    nextStrategy: row.next_strategy,
    recentConcepts,
  };
}

export async function getLatestWeeklyReview(supabase: AppSupabaseClient, userId: string): Promise<WeeklyReviewSummary> {
  const weekStartDate = getCurrentWeekStartDate();
  const recentConcepts = await getRecentConcepts(supabase, userId, weekStartDate);

  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("id, user_id, week_start_date, key_concepts, hardest_concept, common_error_pattern, next_strategy")
    .eq("user_id", userId)
    .order("week_start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return createDefaultWeeklyReview(userId, recentConcepts);
  }

  return mapWeeklyReviewRow(data as WeeklyReviewRow, recentConcepts);
}

export async function createWeeklyReview(
  supabase: AppSupabaseClient,
  input: WeeklyReviewInput,
): Promise<WeeklyReviewSummary> {
  if (!input.userId) {
    throw new Error("주간 회고를 만들려면 사용자 ID가 필요합니다.");
  }

  await ensureUserProfile(supabase, input.userId);

  const weekStartDate = getCurrentWeekStartDate();
  const payload = {
    user_id: input.userId,
    week_start_date: weekStartDate,
    key_concepts: input.keyConcepts.slice(0, 3),
    hardest_concept: input.hardestConcept,
    common_error_pattern: input.commonErrorPattern,
    next_strategy: input.nextStrategy,
  };

  const { data, error } = await supabase
    .from("weekly_reviews")
    .upsert(payload, { onConflict: "user_id,week_start_date" })
    .select("id, user_id, week_start_date, key_concepts, hardest_concept, common_error_pattern, next_strategy")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const recentConcepts = await getRecentConcepts(supabase, input.userId, weekStartDate);
  return mapWeeklyReviewRow(data as WeeklyReviewRow, recentConcepts);
}
