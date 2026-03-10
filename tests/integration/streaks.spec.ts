import { describe, expect, it } from "vitest";

import { calculateCurrentStreak } from "../../backend/src/services/streaks";

describe("streak calculation", () => {
  it("increments for consecutive review dates", () => {
    expect(
      calculateCurrentStreak(["2026-03-09", "2026-03-08", "2026-03-07"], "Asia/Seoul", new Date("2026-03-09T08:00:00Z")),
    ).toBe(3);
  });

  it("resets to zero after a missed day beyond yesterday", () => {
    expect(
      calculateCurrentStreak(["2026-03-07"], "Asia/Seoul", new Date("2026-03-09T08:00:00Z")),
    ).toBe(0);
  });
});
