export function calculateMasteryScore(input: { explanationScore: number; rewriteCompleted: boolean; reviewCount: number }) {
  const normalizedScore = Math.min(5, Math.max(1, input.explanationScore));
  const rewriteBonus = input.rewriteCompleted ? 1 : 0;
  const repetitionBonus = input.reviewCount >= 3 ? 1 : 0;

  return Math.min(5, Math.max(1, normalizedScore + rewriteBonus + repetitionBonus - 1));
}
