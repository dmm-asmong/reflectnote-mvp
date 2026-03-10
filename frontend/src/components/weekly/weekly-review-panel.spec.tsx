import React from "react";

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { WeeklyReviewSummary } from "@backend/types/review";

import { WeeklyReviewPanel } from "./weekly-review-panel";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

const weeklyReview: WeeklyReviewSummary = {
  id: "weekly_001",
  userId: "user-123",
  weekLabel: "2026-03-09 주간 회고",
  keyConcepts: ["광합성"],
  hardestConcept: "ATP",
  commonErrorPattern: "입력과 산출을 자주 뒤섞음",
  nextStrategy: "백지에서 다시 설명하기",
};

afterEach(() => {
  cleanup();
  refresh.mockReset();
  vi.restoreAllMocks();
});

describe("weekly review ui", () => {
  it("saves the weekly review through the API and refreshes the screen", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "weekly_new" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<WeeklyReviewPanel review={weeklyReview} />);

    await userEvent.click(screen.getByRole("button", { name: "ATP" }));
    await userEvent.type(screen.getByPlaceholderText("다음 주에 실제로 지킬 전략을 한두 줄로 적어보세요"), "\n핵심 용어 먼저 확인하기");
    await userEvent.click(screen.getByRole("button", { name: "주간 회고 저장" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/weekly-reviews",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    const request = fetchMock.mock.calls[0]?.[1];
    expect(request.body).toContain("핵심 용어 먼저 확인하기");
    await screen.findByText("주간 회고를 저장했어요.");
    expect(refresh).toHaveBeenCalled();
  });
});
