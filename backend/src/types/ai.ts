export type DifficultyLevel = "elementary" | "middle_school" | "high_school" | "weak" | "incorrect";

export type AiEvaluationResult = {
  score: 1 | 2 | 3 | 4 | 5;
  difficulty: DifficultyLevel;
  feedbackSummary: string;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
  misconceptionFlags: string[];
  metacognitionFlags: string[];
  rewritePrompt: string;
};
