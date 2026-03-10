import type { AiEvaluationResult, DifficultyLevel } from "../backend/src/types/ai";

export const difficultyLevels: DifficultyLevel[] = [
  "elementary",
  "middle_school",
  "high_school",
  "weak",
  "incorrect",
];

export const aiEvaluationJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "score",
    "difficulty",
    "feedback_summary",
    "strengths",
    "improvements",
    "missing_concepts",
    "misconception_flags",
    "metacognition_flags",
    "rewrite_prompt",
  ],
  properties: {
    score: { type: "integer", minimum: 1, maximum: 5 },
    difficulty: { type: "string", enum: difficultyLevels },
    feedback_summary: { type: "string", minLength: 1 },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    missing_concepts: { type: "array", items: { type: "string" } },
    misconception_flags: { type: "array", items: { type: "string" } },
    metacognition_flags: { type: "array", items: { type: "string" } },
    rewrite_prompt: { type: "string", minLength: 1 },
  },
} as const;

export type StoredAiEvaluationResult = {
  score: AiEvaluationResult["score"];
  difficulty: DifficultyLevel;
  feedback_summary: string;
  strengths: string[];
  improvements: string[];
  missing_concepts: string[];
  misconception_flags: string[];
  metacognition_flags: string[];
  rewrite_prompt: string;
};

export function normalizeEvaluationResult(input: unknown): AiEvaluationResult | null {
  const payload = (input ?? {}) as Record<string, unknown>;
  const score = Number(payload.score);
  const difficulty = payload.difficulty;

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return null;
  }

  if (typeof difficulty !== "string" || !difficultyLevels.includes(difficulty as DifficultyLevel)) {
    return null;
  }

  const feedbackSummary = asString(payload.feedback_summary);
  const rewritePrompt = asString(payload.rewrite_prompt);

  if (!feedbackSummary || !rewritePrompt) {
    return null;
  }

  return {
    score: score as AiEvaluationResult["score"],
    difficulty: difficulty as DifficultyLevel,
    feedbackSummary,
    strengths: asStringArray(payload.strengths),
    improvements: asStringArray(payload.improvements),
    missingConcepts: asStringArray(payload.missing_concepts),
    misconceptionFlags: asStringArray(payload.misconception_flags),
    metacognitionFlags: asStringArray(payload.metacognition_flags),
    rewritePrompt,
  };
}

export function toStoredAiEvaluationResult(result: AiEvaluationResult): StoredAiEvaluationResult {
  return {
    score: result.score,
    difficulty: result.difficulty,
    feedback_summary: result.feedbackSummary,
    strengths: result.strengths,
    improvements: result.improvements,
    missing_concepts: result.missingConcepts,
    misconception_flags: result.misconceptionFlags,
    metacognition_flags: result.metacognitionFlags,
    rewrite_prompt: result.rewritePrompt,
  };
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}
