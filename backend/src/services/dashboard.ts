import { calculateCurrentStreak } from "./streaks";

import type { DashboardSummary } from "../types/review";
import type { AppSupabaseClient } from "../types/supabase";

type StudyLogSummaryRow = {
  review_date: string;
  timezone: string | null;
  ai_score: number | null;
};

type MasterySummaryRow = {
  score: number;
  review_count: number;
  concepts: { name: string | null } | Array<{ name: string | null }> | null;
};

export async function getDashboardSummary(supabase: AppSupabaseClient, userId: string): Promise<DashboardSummary> {
  const { data: reviewRows, error: reviewError } = await supabase
    .from("study_logs")
    .select("review_date, timezone, ai_score")
    .eq("user_id", userId)
    .order("review_date", { ascending: false })
    .limit(30);

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  const normalizedReviewRows = (reviewRows ?? []) as StudyLogSummaryRow[];
  const timezone = normalizedReviewRows[0]?.timezone ?? process.env.REFLECTNOTE_DEFAULT_TIMEZONE ?? "Asia/Seoul";
  const currentStreak = calculateCurrentStreak(
    normalizedReviewRows.map((row) => row.review_date),
    timezone,
  );

  const latestScore = normalizedReviewRows.find((row) => typeof row.ai_score === "number")?.ai_score ?? null;

  const { data: masteryRows, error: masteryError } = await supabase
    .from("concept_mastery")
    .select("score, review_count, concepts(name)")
    .eq("user_id", userId)
    .order("score", { ascending: true })
    .order("review_count", { ascending: true })
    .limit(1);

  if (masteryError) {
    throw new Error(masteryError.message);
  }

  const normalizedMasteryRows = (masteryRows ?? []) as MasterySummaryRow[];
  const weakestConcept = normalizedMasteryRows[0];

  const growthTrend = latestScore === null
    ? "아직 없음"
    : latestScore >= 4
      ? "잘 이해 중"
      : latestScore === 3
        ? "보통 수준"
        : "보강 필요";

  return {
    currentStreak,
    todayCtaLabel: normalizedReviewRows[0]?.review_date ? "오늘 복습 이어서 하기" : "오늘의 5분 복습 시작하기",
    growthTrend,
    growthSummary: latestScore !== null ? `가장 최근 이해 점수는 ${latestScore}/5점이에요.` : "첫 복습을 남기면 이해도 흐름이 보이기 시작합니다.",
    recommendedConcept: weakestConcept
      ? {
          name: Array.isArray(weakestConcept.concepts) ? weakestConcept.concepts[0]?.name ?? "개념 다시 보기" : weakestConcept.concepts?.name ?? "개념 다시 보기",
          reason: `현재 mastery는 ${weakestConcept.score}/5점이고, 지금까지 ${weakestConcept.review_count}번 복습했어요.`,
        }
      : {
          name: "아직 추천 개념이 없어요",
          reason: "AI 피드백이 붙은 첫 복습을 완료하면 다시 볼 개념을 추천해드릴게요.",
        },
  };
}
