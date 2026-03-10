import { describe, expect, it } from "vitest";

import { calculateMasteryScore } from "../../backend/src/services/mastery";

describe("concept mastery scoring", () => {
  it("adds a rewrite bonus without requiring another review count increment", () => {
    const beforeRewrite = calculateMasteryScore({
      explanationScore: 4,
      rewriteCompleted: false,
      reviewCount: 1,
    });

    const afterRewrite = calculateMasteryScore({
      explanationScore: 4,
      rewriteCompleted: true,
      reviewCount: 1,
    });

    expect(afterRewrite).toBeGreaterThan(beforeRewrite);
  });

  it("caps mastery at 5", () => {
    expect(
      calculateMasteryScore({
        explanationScore: 5,
        rewriteCompleted: true,
        reviewCount: 5,
      }),
    ).toBe(5);
  });
});
