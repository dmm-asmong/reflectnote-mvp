import type { ProgressSummary } from "../types/review";
import type { AppSupabaseClient } from "../types/supabase";

type ProgressReviewRow = {
  review_date: string;
  ai_score: number;
};

type ProgressMasteryRow = {
  score: number;
  review_count: number;
  concepts: { name: string | null } | Array<{ name: string | null }> | null;
};

export async function getProgressSummary(supabase: AppSupabaseClient, userId: string): Promise<ProgressSummary> {
  const { data: reviewRows, error: reviewError } = await supabase
    .from("study_logs")
    .select("review_date, ai_score")
    .eq("user_id", userId)
    .not("ai_score", "is", null)
    .order("review_date", { ascending: true })
    .limit(30);

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  const { data: masteryRows, error: masteryError } = await supabase
    .from("concept_mastery")
    .select("score, review_count, concepts(name)")
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .limit(12);

  if (masteryError) {
    throw new Error(masteryError.message);
  }

  const normalizedReviewRows = (reviewRows ?? []) as ProgressReviewRow[];
  const normalizedMasteryRows = (masteryRows ?? []) as ProgressMasteryRow[];

  return {
    growthPoints: normalizedReviewRows.map((row) => ({
      date: row.review_date.slice(5),
      score: row.ai_score,
    })),
    mastery: normalizedMasteryRows.map((row) => ({
      name: Array.isArray(row.concepts) ? row.concepts[0]?.name ?? "Concept" : row.concepts?.name ?? "Concept",
      score: row.score,
      reviewCount: row.review_count,
    })),
  };
}
