import { describe, expect, it } from "vitest";

import { getDashboardSummary } from "../../backend/src/services/dashboard";
import { getProgressSummary } from "../../backend/src/services/progress";

function createStudyLogsQuery(rows: unknown[]) {
  return {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    not() {
      return this;
    },
    order() {
      return this;
    },
    limit: async () => ({ data: rows, error: null }),
  };
}

function createMasteryQuery(rows: unknown[]) {
  return {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    order() {
      return this;
    },
    limit: async () => ({ data: rows, error: null }),
  };
}

describe("dashboard and progress summaries", () => {
  it("builds dashboard summary from review history and weakest concept", async () => {
    const supabase = {
      from(table: string) {
        if (table === "study_logs") {
          return createStudyLogsQuery([
            { review_date: "2026-03-09", timezone: "Asia/Seoul", ai_score: 4 },
            { review_date: "2026-03-08", timezone: "Asia/Seoul", ai_score: 3 },
          ]);
        }

        if (table === "concept_mastery") {
          return createMasteryQuery([
            {
              score: 2,
              review_count: 1,
              concepts: { name: "ATP" },
            },
          ]);
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const summary = await getDashboardSummary(supabase as never, "user-123");

    expect(summary.currentStreak).toBe(2);
    expect(summary.todayCtaLabel).toBe("오늘 복습 이어서 하기");
    expect(summary.growthSummary).toBe("가장 최근 이해 점수는 4/5점이에요.");
    expect(summary.recommendedConcept).toEqual({
      name: "ATP",
      reason: "현재 mastery는 2/5점이고, 지금까지 1번 복습했어요.",
    });
  });

  it("returns empty-state dashboard copy before the first evaluated review", async () => {
    const supabase = {
      from(table: string) {
        if (table === "study_logs") {
          return createStudyLogsQuery([]);
        }

        if (table === "concept_mastery") {
          return createMasteryQuery([]);
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const summary = await getDashboardSummary(supabase as never, "user-123");

    expect(summary.currentStreak).toBe(0);
    expect(summary.todayCtaLabel).toBe("오늘의 5분 복습 시작하기");
    expect(summary.growthSummary).toBe("첫 복습을 남기면 이해도 흐름이 보이기 시작합니다.");
    expect(summary.recommendedConcept.name).toBe("아직 추천 개념이 없어요");
  });

  it("builds progress graph points and concept mastery cards from stored rows", async () => {
    const supabase = {
      from(table: string) {
        if (table === "study_logs") {
          return createStudyLogsQuery([
            { review_date: "2026-03-07", ai_score: 2 },
            { review_date: "2026-03-08", ai_score: 4 },
            { review_date: "2026-03-09", ai_score: 5 },
          ]);
        }

        if (table === "concept_mastery") {
          return createMasteryQuery([
            { score: 5, review_count: 3, concepts: { name: "광합성" } },
            { score: 3, review_count: 2, concepts: { name: "ATP" } },
          ]);
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const summary = await getProgressSummary(supabase as never, "user-123");

    expect(summary.growthPoints).toEqual([
      { date: "03-07", score: 2 },
      { date: "03-08", score: 4 },
      { date: "03-09", score: 5 },
    ]);
    expect(summary.mastery).toEqual([
      { name: "광합성", score: 5, reviewCount: 3 },
      { name: "ATP", score: 3, reviewCount: 2 },
    ]);
  });
});
