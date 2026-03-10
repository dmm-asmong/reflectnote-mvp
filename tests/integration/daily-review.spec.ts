import { describe, expect, it } from "vitest";

import { getDraftForToday } from "../../backend/src/services/reviews";
import { parseReviewDraftInput } from "../../backend/src/validation/review";

function createDraftQuery(row: unknown | null) {
  return {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    maybeSingle: async () => ({ data: row, error: null }),
  };
}

describe("daily review input validation", () => {
  it("normalizes multiline fields and preserves the optional wrong-problem note", () => {
    const result = parseReviewDraftInput({
      userId: "user-1",
      reviewDate: "2026-03-09",
      subject: "Biology",
      topic: "Photosynthesis",
      concepts: "chloroplast\nATP\nglucose\nextra concept",
      explanationInitial: "Plants use sunlight.",
      questions: "Why ATP?\nWhy chloroplast?",
      wrongProblemNote: "2 problems, mostly ATP confusion",
      wrongAnswerReasons: "I guessed\nI mixed up terms",
      nextReviewNote: "Review ATP tomorrow",
      timezone: "Asia/Seoul",
    });

    expect(result.concepts).toEqual(["chloroplast", "ATP", "glucose"]);
    expect(result.questions).toEqual(["Why ATP?", "Why chloroplast?"]);
    expect(result.wrongProblemNote).toBe("2 problems, mostly ATP confusion");
    expect(result.wrongAnswerReasons).toEqual(["I guessed", "I mixed up terms"]);
  });

  it("trims empty optional text fields to null", () => {
    const result = parseReviewDraftInput({
      userId: "user-1",
      subject: "Biology",
      topic: "Photosynthesis",
      wrongProblemNote: "   ",
      nextReviewNote: "   ",
    });

    expect(result.wrongProblemNote).toBeNull();
    expect(result.nextReviewNote).toBeNull();
  });

  it("throws when userId is missing", () => {
    expect(() => parseReviewDraftInput({ subject: "Biology" })).toThrow("userId is required.");
  });

  it("returns today's saved draft when a study log already exists", async () => {
    const supabase = {
      from(table: string) {
        if (table !== "study_logs") {
          throw new Error(`Unexpected table: ${table}`);
        }

        return createDraftQuery({
          review_date: "2026-03-09",
          subject: "Biology",
          topic: "Photosynthesis",
          concepts: ["ATP", "Glucose"],
          explanation_initial: "Plants store energy in glucose.",
          questions: ["Why ATP first?"],
          wrong_problem_note: "2 mistakes",
          wrong_answer_reasons: ["I mixed up inputs and outputs"],
          next_review_note: "Review chloroplast steps",
          timezone: "Asia/Seoul",
        });
      },
    };

    const draft = await getDraftForToday(supabase as never, "user-123");

    expect(draft.topic).toBe("Photosynthesis");
    expect(draft.concepts).toEqual(["ATP", "Glucose"]);
    expect(draft.questions).toEqual(["Why ATP first?"]);
  });

  it("returns a default draft when today's study log does not exist yet", async () => {
    const supabase = {
      from(table: string) {
        if (table !== "study_logs") {
          throw new Error(`Unexpected table: ${table}`);
        }

        return createDraftQuery(null);
      },
    };

    const draft = await getDraftForToday(supabase as never, "user-123");

    expect(draft.subject).toBe("과학");
    expect(draft.topic).toBe("광합성");
    expect(draft.explanationInitial).toBe("");
  });
});
