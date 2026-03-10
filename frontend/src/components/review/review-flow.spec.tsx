import React from "react";

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { AiEvaluationResult } from "@backend/types/ai";
import type { StudyLogDraft } from "@backend/types/review";

import { DailyReviewForm } from "./daily-review-form";
import { ReviewFeedbackPanel } from "./review-feedback-panel";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

const initialDraft: StudyLogDraft = {
  reviewDate: "2026-03-09",
  subject: "과학",
  topic: "광합성",
  concepts: ["핵심 정의"],
  explanationInitial: "식물은 빛에너지를 이용해 포도당을 만든다.",
  questions: [],
  wrongProblemNote: null,
  wrongAnswerReasons: [],
  nextReviewNote: null,
  timezone: "Asia/Seoul",
};

const feedback: AiEvaluationResult = {
  score: 4,
  difficulty: "middle_school",
  feedbackSummary: "핵심은 잘 잡고 있어요.",
  strengths: ["주요 개념을 분명히 설명했어요"],
  improvements: ["한 단계만 더 쉽게 풀어보면 좋아요"],
  missingConcepts: [],
  misconceptionFlags: [],
  metacognitionFlags: [],
  rewritePrompt: "더 쉬운 말로 다시 설명해보세요.",
};

afterEach(() => {
  cleanup();
  push.mockReset();
  refresh.mockReset();
  vi.restoreAllMocks();
});

describe("review ui flows", () => {
  it("saves the daily review draft through the API and refreshes the screen", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "review-1", status: "draft", reviewDate: "2026-03-09" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DailyReviewForm initialDraft={initialDraft} />);

    await userEvent.click(screen.getByRole("button", { name: "임시 저장" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/reviews", expect.objectContaining({ method: "POST" }));
    });
    await screen.findByText("임시 저장했어요.");
    expect(refresh).toHaveBeenCalled();
  });

  it("saves and evaluates the review, then navigates to the detail page", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "review-42", status: "submitted", reviewDate: "2026-03-09" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ score: 4 }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<DailyReviewForm initialDraft={initialDraft} />);

    await userEvent.click(screen.getByRole("button", { name: "AI 피드백 받기" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/reviews", expect.objectContaining({ method: "POST" }));
      expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/reviews/review-42/evaluate", { method: "POST" });
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/review/review-42");
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("saves the rewrite and refreshes the page", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reviewId: "review-42", explanationRewritten: "더 쉬운 설명.", status: "rewritten" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ReviewFeedbackPanel reviewId="review-42" feedback={feedback} rewrittenExplanation="" />);

    await userEvent.type(screen.getByPlaceholderText("방금 받은 피드백을 참고해서, 더 쉽고 짧은 문장으로 다시 설명해보세요."), "더 쉬운 설명.");
    await userEvent.click(screen.getByRole("button", { name: "다시 쓴 설명 저장" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/reviews/review-42/rewrite",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ explanationRewritten: "더 쉬운 설명." }),
        }),
      );
    });
    await screen.findByText("다시 쓴 설명을 저장했어요.");
    expect(refresh).toHaveBeenCalled();
  });

  it("returns to the review entry page from the feedback panel", async () => {
    render(<ReviewFeedbackPanel reviewId="review-42" feedback={feedback} rewrittenExplanation="" />);

    await userEvent.click(screen.getByRole("button", { name: "복습 화면으로 돌아가기" }));

    expect(push).toHaveBeenCalledWith("/review");
  });
});
