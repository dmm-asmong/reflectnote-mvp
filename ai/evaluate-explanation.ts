import { createFallbackEvaluation } from "./fallbacks";
import { normalizeEvaluationResult } from "./schema";

export type EvaluateExplanationInput = {
  topic: string;
  concepts: string[];
  explanation: string;
  questions?: string[];
  wrongAnswerReasons?: string[];
};

const SYSTEM_PROMPT = [
  "You are ReflectNote's learning coach for Korean high school students.",
  "Evaluate conceptual understanding, not effort.",
  "All text fields (feedback_summary, strengths, improvements, missing_concepts, misconception_flags, metacognition_flags, rewrite_prompt) MUST be written in Korean.",
  "Be supportive, specific, and concise.",
  "Return strict JSON only.",
].join(" ");

export function buildEvaluationPrompt(input: EvaluateExplanationInput) {
  const sanitized = sanitizeAiInput(input);
  const questions = sanitized.questions;
  const wrongAnswerReasons = sanitized.wrongAnswerReasons;
  const formattedQuestions = questions.length > 0 ? questions.join(" | ") : "None";
  const formattedWrongAnswerReasons = wrongAnswerReasons.length > 0 ? wrongAnswerReasons.join(" | ") : "None";

  return [
    "Evaluate the student's explanation.",
    `Topic: ${sanitized.topic}`,
    `Key concepts: ${sanitized.concepts.join(", ") || "None provided"}`,
    `Student explanation: ${sanitized.explanation || ""}`,
    `Student questions: ${formattedQuestions}`,
    `Wrong answer reasons: ${formattedWrongAnswerReasons}`,
    "Classify difficulty as elementary, middle_school, high_school, weak, or incorrect.",
    "If elementary, the feedback should signal excellent understanding.",
    "If middle_school, the feedback should signal good understanding.",
    "If high_school, the feedback should suggest simplification.",
    "If metacognition is weak, add coaching in metacognition_flags.",
    "Return JSON only with keys: score, difficulty, feedback_summary, strengths, improvements, missing_concepts, misconception_flags, metacognition_flags, rewrite_prompt.",
  ].join("\n");
}

export async function evaluateExplanation(input: EvaluateExplanationInput) {
  const sanitized = sanitizeAiInput(input);
  const modelResult = await tryOpenAiEvaluation(sanitized);

  if (modelResult) {
    return modelResult;
  }

  return evaluateExplanationHeuristically(sanitized);
}

async function tryOpenAiEvaluation(input: EvaluateExplanationInput) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_EVAL_MODEL ?? "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildEvaluationPrompt(input) },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API Error:", await response.text());
      return null;
    }

    const payload = await response.json();
    const text = payload.choices?.[0]?.message?.content;

    if (!text) {
      return null;
    }

    return normalizeEvaluationResult(JSON.parse(text));
  } catch (error) {
    console.error("Failed to fetch OpenAI evaluation:", error);
    return null;
  }
}

function evaluateExplanationHeuristically(input: EvaluateExplanationInput) {
  const explanation = input.explanation.trim();
  const explanationLower = explanation.toLowerCase();
  const concepts = input.concepts.filter(Boolean);

  const matchedConcepts = concepts.filter((concept) => explanationLower.includes(concept.toLowerCase()));
  const missingConcepts = concepts.filter((concept) => !matchedConcepts.includes(concept));
  const coverageRatio = concepts.length > 0 ? matchedConcepts.length / concepts.length : 0;
  const sentenceCount = explanation.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean).length;
  const wordCount = explanation.split(/\s+/).map((item) => item.trim()).filter(Boolean).length;

  const misconceptionFlags: string[] = [];
  if (!explanation) {
    misconceptionFlags.push("설명이 입력되지 않았어요.");
  }
  if (/모르겠|잘 모름|이해 안 됨|모르겠어요/i.test(explanation)) {
    misconceptionFlags.push("개념을 설명하지 않고 모른다는 표현만 적혀 있어요.");
  }
  if (input.topic && !explanationLower.includes(input.topic.toLowerCase()) && coverageRatio === 0 && wordCount < 12) {
    misconceptionFlags.push("설명이 너무 짧거나 추상적이어서 핵심 개념을 확인하기 어려워요.");
  }

  const metacognitionFlags: string[] = [];
  const questions = input.questions ?? [];
  const reasons = input.wrongAnswerReasons ?? [];
  if (questions.length === 0) {
    metacognitionFlags.push("아직 헷갈리는 부분을 질문 형태로 하나 적어보세요.");
  }
  if (reasons.length === 0 || reasons.every((reason) => /guess|rushed|mistake/i.test(reason) && reason.trim().split(/\s+/).length <= 3)) {
    metacognitionFlags.push("왜 틀렸는지 좀 더 구체적으로 적어두면 다음 복습이 더 정확해져요.");
  }

  let difficulty: "elementary" | "middle_school" | "high_school" | "weak" | "incorrect" = "high_school";
  let score: 1 | 2 | 3 | 4 | 5 = 3;

  if ((!explanation || misconceptionFlags.length > 0) && coverageRatio === 0) {
    difficulty = "incorrect";
    score = 1;
  } else if (coverageRatio < 0.5 || wordCount < 10) {
    difficulty = "weak";
    score = 2;
  } else if (coverageRatio >= 0.5 && coverageRatio < 1) {
    difficulty = "high_school";
    score = 3;
  } else if (coverageRatio === 1 && sentenceCount <= 3 && wordCount <= 35) {
    difficulty = "elementary";
    score = 5;
  } else if (coverageRatio === 1) {
    difficulty = "middle_school";
    score = 4;
  }

  let feedbackSummary = "";
  if (difficulty === "elementary") {
    feedbackSummary = "이해도가 아주 좋아요. 설명이 명확하고 핵심을 잘 짚었습니다.";
  } else if (difficulty === "middle_school") {
    feedbackSummary = "이해도가 좋아요. 설명이 대체로 정확하고 중요한 내용을 잘 담고 있어요.";
  } else if (difficulty === "high_school") {
    feedbackSummary = "이해 방향은 맞지만, 핵심 단계를 좀 더 단순하고 쉽게 풀어쓰면 설명이 더 또렷해질 거예요.";
  } else if (difficulty === "weak") {
    feedbackSummary = "개념의 일부는 잡혔지만, 빠진 단계가 있어요. 설명을 좀 더 완성해볼까요?";
  } else {
    feedbackSummary = "아직 개념이 설명에 명확히 드러나지 않아요. 핵심부터 하나씩 다시 쌓아봐요.";
  }

  const strengths = matchedConcepts.length > 0
    ? [
      `'${matchedConcepts[0]}' 개념을 설명에 올바르게 포함시켰어요.`,
      ...(difficulty === "elementary" || difficulty === "middle_school"
        ? ["암기한 문장 그대로가 아닌, 이해한 내용으로 설명하려 했어요."]
        : []),
    ]
    : ["수업 주제와 완전히 벗어나지 않고 연결된 내용을 썼어요."];

  const improvements = [
    ...(missingConcepts.length > 0 ? [`'${missingConcepts[0]}' 개념을 설명에 추가해보세요.`] : []),
    ...(difficulty === "high_school" ? ["설명을 더 짧고 간결한 문장으로 다시 써보세요."] : []),
    ...(difficulty === "weak" || difficulty === "incorrect"
      ? ["핵심 과정을 순서대로 단계별로 설명해보세요."]
      : []),
  ].slice(0, 3);

  const rewritePrompt =
    difficulty === "elementary"
      ? `'${input.topic}'을 2문장으로 다시 설명하고, 뒷받침 근거를 하나 추가해보세요.`
      : difficulty === "middle_school"
        ? `'${input.topic}'을 더 쉬운 말로 다시 설명해보세요. 중학생도 이해할 수 있을 만큼 단순하게 써보세요.`
        : difficulty === "high_school"
          ? `'${input.topic}'을 2~4문장으로 다시 쓰고, 핵심 단계를 더 단순하게 표현해보세요.`
          : `'${input.topic}'을 3문장으로 다시 써보세요. '${missingConcepts[0] ?? "빠진 핵심 개념"}'을 포함하고, 아직 헷갈리는 부분도 함께 적어보세요.`;

  const result = {
    score,
    difficulty,
    feedbackSummary,
    strengths: strengths.slice(0, 3),
    improvements: improvements.length > 0 ? improvements : ["핵심 개념을 한 단계 더 명확하게 정의해서 설명해보세요."],
    missingConcepts: missingConcepts.slice(0, 3),
    misconceptionFlags,
    metacognitionFlags,
    rewritePrompt,
  };

  return normalizeEvaluationResult({
    score: result.score,
    difficulty: result.difficulty,
    feedback_summary: result.feedbackSummary,
    strengths: result.strengths,
    improvements: result.improvements,
    missing_concepts: result.missingConcepts,
    misconception_flags: result.misconceptionFlags,
    metacognition_flags: result.metacognitionFlags,
    rewrite_prompt: result.rewritePrompt,
  }) ?? createFallbackEvaluation();
}

function sanitizeAiInput(input: EvaluateExplanationInput): Required<Pick<EvaluateExplanationInput, "questions" | "wrongAnswerReasons">> & Omit<EvaluateExplanationInput, "questions" | "wrongAnswerReasons"> {
  return {
    topic: scrubSensitiveText(input.topic),
    concepts: input.concepts.map(scrubSensitiveText).slice(0, 3),
    explanation: scrubSensitiveText(input.explanation),
    questions: (input.questions ?? []).map(scrubSensitiveText).slice(0, 3),
    wrongAnswerReasons: (input.wrongAnswerReasons ?? []).map(scrubSensitiveText).slice(0, 3),
  };
}

function scrubSensitiveText(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted-phone]")
    .trim();
}
