import type { ReviewDraftInput } from "../types/review";

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseReviewDraftInput(input: unknown): ReviewDraftInput {
  const payload = (input ?? {}) as Record<string, unknown>;

  if (typeof payload.userId !== "string" || payload.userId.trim().length === 0) {
    throw new Error("userId is required.");
  }

  return {
    userId: payload.userId,
    reviewDate: typeof payload.reviewDate === "string" ? payload.reviewDate : new Date().toISOString().slice(0, 10),
    subject: typeof payload.subject === "string" ? payload.subject.trim() : "",
    topic: typeof payload.topic === "string" ? payload.topic.trim() : "",
    concepts: toStringArray(payload.concepts).slice(0, 3),
    explanationInitial:
      typeof payload.explanationInitial === "string" ? payload.explanationInitial.trim() : "",
    questions: toStringArray(payload.questions).slice(0, 3),
    wrongProblemNote: toNullableString(payload.wrongProblemNote),
    wrongAnswerReasons: toStringArray(payload.wrongAnswerReasons).slice(0, 3),
    nextReviewNote: toNullableString(payload.nextReviewNote),
    timezone: typeof payload.timezone === "string" ? payload.timezone : "Asia/Seoul",
  };
}
