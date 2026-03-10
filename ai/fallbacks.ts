import type { AiEvaluationResult } from "../backend/src/types/ai";

export function createFallbackEvaluation(): AiEvaluationResult {
  return {
    score: 3,
    difficulty: "high_school",
    feedbackSummary:
      "이해 방향은 맞지만, 설명을 조금 더 단순하게 다듬으면 핵심이 더 잘 드러날 거예요.",
    strengths: ["주제에서 벗어나지 않고 설명했어요."],
    improvements: ["더 쉬운 말로 바꿔보세요.", "핵심 단계 하나를 더 명확히 풀어서 설명해보세요."],
    missingConcepts: [],
    misconceptionFlags: [],
    metacognitionFlags: ["아직 헷갈리는 부분을 하나 구체적으로 적어보세요."],
    rewritePrompt: "설명을 2~4문장으로 다시 쓰고, 핵심 단계를 더 이해하기 쉽게 표현해보세요.",
  };
}
