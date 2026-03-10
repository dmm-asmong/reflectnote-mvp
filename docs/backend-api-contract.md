# ReflectNote Backend API Contract

## Authentication
- Provider: Supabase Auth
- Session source: authenticated Next.js server request
- User profile sync: `auth.users` -> `public.users` trigger

## Endpoints
### GET /api/dashboard
Response
```json
{
  "currentStreak": 4,
  "todayCtaLabel": "Continue today's review",
  "growthSummary": "Latest understanding score: 4/5.",
  "recommendedConcept": {
    "name": "Photosynthesis",
    "reason": "Current mastery is 2/5 after 1 reviews."
  }
}
```

### GET /api/progress
Response
```json
{
  "growthPoints": [
    { "date": "03-05", "score": 3 },
    { "date": "03-07", "score": 4 }
  ],
  "mastery": [
    { "name": "ATP", "score": 2, "reviewCount": 1 }
  ]
}
```

### POST /api/reviews
Request
```json
{
  "reviewDate": "2026-03-09",
  "subject": "Biology",
  "topic": "Photosynthesis",
  "concepts": ["Chloroplast", "ATP"],
  "explanationInitial": "Plants convert light to stored energy.",
  "questions": ["Why is ATP needed?"],
  "wrongProblemNote": "2 problems, mostly ATP confusion",
  "wrongAnswerReasons": ["Mixed up ATP and glucose"],
  "nextReviewNote": "Review ATP next",
  "timezone": "Asia/Seoul"
}
```
Response
```json
{
  "id": "uuid",
  "status": "submitted",
  "reviewDate": "2026-03-09"
}
```

### POST /api/reviews/:id/evaluate
Response
```json
{
  "score": 4,
  "difficulty": "middle_school",
  "feedbackSummary": "The explanation is supportive and mostly correct.",
  "strengths": ["Uses approachable language"],
  "improvements": ["Clarify ATP"],
  "missingConcepts": ["ATP"],
  "misconceptionFlags": [],
  "metacognitionFlags": ["Could say what still feels uncertain"],
  "rewritePrompt": "Rewrite the explanation in simpler language."
}
```

### POST /api/reviews/:id/rewrite
Request
```json
{
  "explanationRewritten": "Light energy helps the plant make ATP and then glucose."
}
```
Response
```json
{
  "reviewId": "uuid",
  "explanationRewritten": "Light energy helps the plant make ATP and then glucose.",
  "status": "rewritten"
}
```
