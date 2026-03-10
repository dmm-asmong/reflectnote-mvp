import { describe, expect, it } from "vitest";

import { buildEvaluationPrompt, evaluateExplanation } from "../../ai/evaluate-explanation";
import { createFallbackEvaluation } from "../../ai/fallbacks";
import { normalizeEvaluationResult } from "../../ai/schema";

describe("ai feedback handling", () => {
  it("normalizes the expected JSON shape", () => {
    const result = normalizeEvaluationResult({
      score: 4,
      difficulty: "middle_school",
      feedback_summary: "Clear and mostly correct.",
      strengths: ["Simple wording"],
      improvements: ["Add one missing concept"],
      missing_concepts: ["ATP"],
      misconception_flags: [],
      metacognition_flags: [],
      rewrite_prompt: "Rewrite it in 3 sentences.",
    });

    expect(result?.score).toBe(4);
  });

  it("redacts obvious personal data before building the AI prompt", () => {
    const prompt = buildEvaluationPrompt({
      topic: "Photosynthesis",
      concepts: ["chloroplast"],
      explanation: "Email me at student@example.com and visit https://example.com or call 010-1234-5678.",
      questions: ["Can you send notes to student@example.com?"],
      wrongAnswerReasons: ["I shared my number 010-1234-5678"],
    });

    expect(prompt).not.toContain("student@example.com");
    expect(prompt).not.toContain("https://example.com");
    expect(prompt).not.toContain("010-1234-5678");
    expect(prompt).toContain("[redacted-email]");
    expect(prompt).toContain("[redacted-url]");
    expect(prompt).toContain("[redacted-phone]");
  });

  it("marks a clear explanation as excellent or good without using weak coaching", async () => {
    const result = await evaluateExplanation({
      topic: "Photosynthesis",
      concepts: ["chloroplast", "ATP", "glucose"],
      explanation: "Plants use sunlight in the chloroplast to make ATP and then store that energy in glucose.",
      questions: ["Why is ATP needed before glucose is made?"],
      wrongAnswerReasons: ["I used to mix up ATP and glucose, but I corrected that."],
    });

    expect(["elementary", "middle_school"]).toContain(result.difficulty);
    expect(result.feedbackSummary).toMatch(/Excellent understanding|Good understanding/);
    expect(result.metacognitionFlags.length).toBe(0);
  });

  it("adds coaching when understanding and metacognition are weak", async () => {
    const result = await evaluateExplanation({
      topic: "Photosynthesis",
      concepts: ["chloroplast", "ATP", "glucose"],
      explanation: "Plants make glucose from sunlight.",
      questions: [],
      wrongAnswerReasons: ["I guessed"],
    });

    expect(["weak", "incorrect"]).toContain(result.difficulty);
    expect(result.missingConcepts.length).toBeGreaterThan(0);
    expect(result.metacognitionFlags.length).toBeGreaterThan(0);
  });

  it("falls back to safe feedback when the payload is invalid", () => {
    expect(createFallbackEvaluation().rewritePrompt.length).toBeGreaterThan(0);
  });
});
