import { describe, expect, it } from "vitest";

import { createWeeklyReview, getLatestWeeklyReview } from "../../backend/src/services/weekly-reviews";

describe("weekly review services", () => {
  it("returns the latest stored weekly review when one exists", async () => {
    const supabase = {
      from() {
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
          limit() {
            return this;
          },
          maybeSingle: async () => ({
            data: {
              id: "weekly_001",
              user_id: "user-123",
              week_start_date: "2026-03-09",
              key_concepts: ["광합성", "세포 호흡", "ATP 순환"],
              hardest_concept: "ATP",
              common_error_pattern: "입력과 산출을 자주 뒤섞음",
              next_strategy: "기억만으로 다시 설명해보기",
            },
            error: null,
          }),
        };
      },
    };

    const review = await getLatestWeeklyReview(supabase as never, "user-123");

    expect(review.weekLabel).toBe("2026-03-09 주간 회고");
    expect(review.keyConcepts).toEqual(["광합성", "세포 호흡", "ATP 순환"]);
    expect(review.hardestConcept).toBe("ATP");
  });

  it("returns an empty weekly review when none exists yet", async () => {
    const supabase = {
      from() {
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
          limit() {
            return this;
          },
          maybeSingle: async () => ({ data: null, error: null }),
        };
      },
    };

    const review = await getLatestWeeklyReview(supabase as never, "user-123");

    expect(review.userId).toBe("user-123");
    expect(review.keyConcepts).toEqual([]);
    expect(review.weekLabel).toContain("주간 회고");
  });

  it("upserts a weekly review for the current week", async () => {
    const upsertWeekly = async () => ({
      data: {
        id: "weekly_002",
        user_id: "user-123",
        week_start_date: "2026-03-09",
        key_concepts: ["ATP", "세포 호흡"],
        hardest_concept: "ATP",
        common_error_pattern: "계산 실수",
        next_strategy: "한 문제를 끝까지 천천히 풀기",
      },
      error: null,
    });

    const supabase = {
      auth: {
        getUser: async () => ({
          data: { user: { id: "user-123", email: "student@example.com" } },
          error: null,
        }),
      },
      from(table: string) {
        if (table === "users") {
          return {
            upsert() {
              return {
                select() {
                  return {
                    single: async () => ({
                      data: { id: "user-123", email: "student@example.com", grade: null, created_at: "2026-03-09T00:00:00Z" },
                      error: null,
                    }),
                  };
                },
              };
            },
          };
        }

        if (table === "weekly_reviews") {
          return {
            upsert() {
              return {
                select() {
                  return {
                    single: upsertWeekly,
                  };
                },
              };
            },
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const review = await createWeeklyReview(supabase as never, {
      userId: "user-123",
      keyConcepts: ["ATP", "세포 호흡"],
      hardestConcept: "ATP",
      commonErrorPattern: "계산 실수",
      nextStrategy: "한 문제를 끝까지 천천히 풀기",
    });

    expect(review.id).toBe("weekly_002");
    expect(review.weekLabel).toBe("2026-03-09 주간 회고");
    expect(review.nextStrategy).toBe("한 문제를 끝까지 천천히 풀기");
  });
});
