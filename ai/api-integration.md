# ReflectNote AI API Integration Design

## Call site
- Backend service: `backend/src/services/reviews.ts`
- Entry point: `evaluateReviewExplanation(userId, reviewId)`

## Input contract from backend to AI
```ts
{
  topic: string;
  concepts: string[];
  explanation: string;
  questions?: string[];
  wrongAnswerReasons?: string[];
}
```

## Output contract from AI to backend
```ts
{
  score: 1 | 2 | 3 | 4 | 5;
  difficulty: "elementary" | "middle_school" | "high_school" | "weak" | "incorrect";
  feedbackSummary: string;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
  misconceptionFlags: string[];
  metacognitionFlags: string[];
  rewritePrompt: string;
}
```

## Persistence mapping
Store the normalized result in `study_logs` as:
- `ai_score`
- `ai_difficulty`
- `ai_feedback_json`

`ai_feedback_json` should preserve snake_case for storage compatibility:
```json
{
  "score": 4,
  "difficulty": "middle_school",
  "feedback_summary": "Good understanding overall.",
  "strengths": ["..."],
  "improvements": ["..."],
  "missing_concepts": ["..."],
  "misconception_flags": [],
  "metacognition_flags": ["..."],
  "rewrite_prompt": "..."
}
```

## Runtime behavior
1. Backend loads a saved `study_log`.
2. Backend passes topic, concepts, explanation, questions, and wrong-answer reasons to the AI evaluator.
3. AI layer builds the prompt and attempts model evaluation when `OPENAI_API_KEY` exists.
4. If model output is invalid or unavailable, AI falls back to local heuristic evaluation.
5. Backend persists normalized JSON and derived score/difficulty.
