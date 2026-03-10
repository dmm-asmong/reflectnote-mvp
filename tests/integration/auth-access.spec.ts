import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  getOptionalUserId: vi.fn(),
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: vi.fn(),
}));

vi.mock("@backend/services/dashboard", () => ({
  getDashboardSummary: vi.fn(),
}));

vi.mock("@backend/services/progress", () => ({
  getProgressSummary: vi.fn(),
}));

vi.mock("@backend/services/reviews", () => ({
  createOrUpdateReviewDraft: vi.fn(),
  evaluateReviewExplanation: vi.fn(),
  saveRewrite: vi.fn(),
}));

vi.mock("@backend/services/weekly-reviews", () => ({
  createWeeklyReview: vi.fn(),
}));

vi.mock("@backend/validation/review", () => ({
  parseReviewDraftInput: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("auth access rules", () => {
  it("returns 401 from dashboard route when unauthenticated", async () => {
    const { getOptionalUserId } = await import("@/lib/auth");
    vi.mocked(getOptionalUserId).mockResolvedValue(null);

    const route = await import("../../frontend/src/app/api/dashboard/route");
    const response = await route.GET();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication required.");
  });

  it("passes the session user and scoped supabase client into dashboard service", async () => {
    const scopedSupabase = { kind: "scoped-client" };
    const summary = {
      currentStreak: 2,
      todayCtaLabel: "Continue today's review",
      growthSummary: "Latest understanding score: 4/5.",
      recommendedConcept: {
        name: "ATP",
        reason: "Current mastery is 2/5 after 1 reviews.",
      },
    };

    const { getOptionalUserId } = await import("@/lib/auth");
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    const { getDashboardSummary } = await import("@backend/services/dashboard");

    vi.mocked(getOptionalUserId).mockResolvedValue("user-123");
    vi.mocked(getSupabaseServerClient).mockResolvedValue(scopedSupabase as never);
    vi.mocked(getDashboardSummary).mockResolvedValue(summary);

    const route = await import("../../frontend/src/app/api/dashboard/route");
    const response = await route.GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(getDashboardSummary).toHaveBeenCalledWith(scopedSupabase, "user-123");
    expect(payload.currentStreak).toBe(2);
  });

  it("returns 401 from progress route when unauthenticated", async () => {
    const { getOptionalUserId } = await import("@/lib/auth");
    vi.mocked(getOptionalUserId).mockResolvedValue(null);

    const route = await import("../../frontend/src/app/api/progress/route");
    const response = await route.GET();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication required.");
  });

  it("passes the session user and scoped supabase client into progress service", async () => {
    const scopedSupabase = { kind: "scoped-client" };
    const summary = {
      growthPoints: [
        { label: "Mon", score: 3 },
        { label: "Tue", score: 4 },
      ],
      mastery: [
        { concept: "ATP", score: 4, reviewCount: 2 },
      ],
    };

    const { getOptionalUserId } = await import("@/lib/auth");
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    const { getProgressSummary } = await import("@backend/services/progress");

    vi.mocked(getOptionalUserId).mockResolvedValue("user-123");
    vi.mocked(getSupabaseServerClient).mockResolvedValue(scopedSupabase as never);
    vi.mocked(getProgressSummary).mockResolvedValue(summary as never);

    const route = await import("../../frontend/src/app/api/progress/route");
    const response = await route.GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(getProgressSummary).toHaveBeenCalledWith(scopedSupabase, "user-123");
    expect(payload.growthPoints).toHaveLength(2);
  });

  it("returns 401 from review save route when unauthenticated", async () => {
    const { getOptionalUserId } = await import("@/lib/auth");
    vi.mocked(getOptionalUserId).mockResolvedValue(null);

    const route = await import("../../frontend/src/app/api/reviews/route");
    const request = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "Photosynthesis" }),
    });
    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication required.");
  });

  it("passes authenticated review submissions through validation and the scoped client", async () => {
    const scopedSupabase = { kind: "scoped-client" };
    const parsedInput = {
      userId: "user-123",
      reviewDate: "2026-03-09",
      subject: "Biology",
      topic: "Photosynthesis",
      concepts: ["ATP"],
      explanationInitial: "Plants use sunlight.",
      questions: [],
      wrongProblemNote: null,
      wrongAnswerReasons: [],
      nextReviewNote: null,
      timezone: "Asia/Seoul",
    };
    const savedReview = {
      id: "review-1",
      status: "submitted",
      reviewDate: "2026-03-09",
    };

    const { getOptionalUserId } = await import("@/lib/auth");
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    const { parseReviewDraftInput } = await import("@backend/validation/review");
    const { createOrUpdateReviewDraft } = await import("@backend/services/reviews");

    vi.mocked(getOptionalUserId).mockResolvedValue("user-123");
    vi.mocked(getSupabaseServerClient).mockResolvedValue(scopedSupabase as never);
    vi.mocked(parseReviewDraftInput).mockReturnValue(parsedInput as never);
    vi.mocked(createOrUpdateReviewDraft).mockResolvedValue(savedReview as never);

    const route = await import("../../frontend/src/app/api/reviews/route");
    const request = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "Photosynthesis" }),
    });
    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(parseReviewDraftInput).toHaveBeenCalledWith({ topic: "Photosynthesis", userId: "user-123" });
    expect(createOrUpdateReviewDraft).toHaveBeenCalledWith(scopedSupabase, parsedInput);
    expect(payload.id).toBe("review-1");
  });

  it("returns 401 from evaluate route when unauthenticated", async () => {
    const { getOptionalUserId } = await import("@/lib/auth");
    vi.mocked(getOptionalUserId).mockResolvedValue(null);

    const route = await import("../../frontend/src/app/api/reviews/[id]/evaluate/route");
    const response = await route.POST(new Request("http://localhost/api/reviews/review-1/evaluate", { method: "POST" }), {
      params: Promise.resolve({ id: "review-1" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication required.");
  });

  it("passes the session user and scoped client into evaluate route service", async () => {
    const scopedSupabase = { kind: "scoped-client" };
    const evaluation = {
      score: 4,
      difficulty: "middle_school",
      feedbackSummary: "Good understanding.",
      strengths: ["Clear main idea"],
      improvements: ["Simplify one step"],
      missingConcepts: [],
      misconceptionFlags: [],
      metacognitionFlags: [],
      rewritePrompt: "Rewrite it more simply.",
    };

    const { getOptionalUserId } = await import("@/lib/auth");
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    const { evaluateReviewExplanation } = await import("@backend/services/reviews");

    vi.mocked(getOptionalUserId).mockResolvedValue("user-123");
    vi.mocked(getSupabaseServerClient).mockResolvedValue(scopedSupabase as never);
    vi.mocked(evaluateReviewExplanation).mockResolvedValue(evaluation as never);

    const route = await import("../../frontend/src/app/api/reviews/[id]/evaluate/route");
    const response = await route.POST(new Request("http://localhost/api/reviews/review-1/evaluate", { method: "POST" }), {
      params: Promise.resolve({ id: "review-1" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(evaluateReviewExplanation).toHaveBeenCalledWith(scopedSupabase, "user-123", "review-1");
    expect(payload.score).toBe(4);
  });

  it("returns 401 from rewrite route when unauthenticated", async () => {
    const { getOptionalUserId } = await import("@/lib/auth");
    vi.mocked(getOptionalUserId).mockResolvedValue(null);

    const route = await import("../../frontend/src/app/api/reviews/[id]/rewrite/route");
    const response = await route.POST(
      new Request("http://localhost/api/reviews/review-1/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explanationRewritten: "Simpler explanation." }),
      }),
      {
        params: Promise.resolve({ id: "review-1" }),
      },
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication required.");
  });

  it("passes rewrite payload through to the scoped rewrite service", async () => {
    const scopedSupabase = { kind: "scoped-client" };
    const rewriteResult = {
      reviewId: "review-1",
      explanationRewritten: "Simpler explanation.",
      status: "rewritten",
    };

    const { getOptionalUserId } = await import("@/lib/auth");
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    const { saveRewrite } = await import("@backend/services/reviews");

    vi.mocked(getOptionalUserId).mockResolvedValue("user-123");
    vi.mocked(getSupabaseServerClient).mockResolvedValue(scopedSupabase as never);
    vi.mocked(saveRewrite).mockResolvedValue(rewriteResult as never);

    const route = await import("../../frontend/src/app/api/reviews/[id]/rewrite/route");
    const response = await route.POST(
      new Request("http://localhost/api/reviews/review-1/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explanationRewritten: "Simpler explanation." }),
      }),
      {
        params: Promise.resolve({ id: "review-1" }),
      },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(saveRewrite).toHaveBeenCalledWith(scopedSupabase, "user-123", "review-1", "Simpler explanation.");
    expect(payload.status).toBe("rewritten");
  });

  it("returns 401 from weekly review route when unauthenticated", async () => {
    const { getOptionalUserId } = await import("@/lib/auth");
    vi.mocked(getOptionalUserId).mockResolvedValue(null);

    const route = await import("../../frontend/src/app/api/weekly-reviews/route");
    const request = new Request("http://localhost/api/weekly-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hardestConcept: "ATP" }),
    });
    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication required.");
  });

  it("passes the authenticated user and scoped client into weekly review creation", async () => {
    const scopedSupabase = { kind: "scoped-client" };
    const createdWeeklyReview = {
      id: "weekly_new",
      userId: "user-123",
      weekLabel: "Week of 2026-03-09",
      keyConcepts: ["ATP", "Cell respiration"],
      hardestConcept: "ATP",
      commonErrorPattern: "Mixing up inputs and outputs.",
      nextStrategy: "Rewrite one comparison from memory.",
    };

    const { getOptionalUserId } = await import("@/lib/auth");
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    const { createWeeklyReview } = await import("@backend/services/weekly-reviews");

    vi.mocked(getOptionalUserId).mockResolvedValue("user-123");
    vi.mocked(getSupabaseServerClient).mockResolvedValue(scopedSupabase as never);
    vi.mocked(createWeeklyReview).mockResolvedValue(createdWeeklyReview as never);

    const route = await import("../../frontend/src/app/api/weekly-reviews/route");
    const request = new Request("http://localhost/api/weekly-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyConcepts: ["ATP", "Cell respiration"],
        hardestConcept: "ATP",
        commonErrorPattern: "Mixing up inputs and outputs.",
        nextStrategy: "Rewrite one comparison from memory.",
      }),
    });
    const response = await route.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(createWeeklyReview).toHaveBeenCalledWith(scopedSupabase, {
      userId: "user-123",
      keyConcepts: ["ATP", "Cell respiration"],
      hardestConcept: "ATP",
      commonErrorPattern: "Mixing up inputs and outputs.",
      nextStrategy: "Rewrite one comparison from memory.",
    });
    expect(payload.id).toBe("weekly_new");
  });
});
