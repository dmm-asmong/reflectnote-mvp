# ReflectNote MVP PRD

## 1. Product summary
ReflectNote is an AI-powered learning journal web app for high school students. It is designed to improve conceptual understanding and metacognition through short daily lesson reviews.

## 2. Core value proposition
Students do not just log what they studied. They:
- review what they learned
- explain concepts in their own words
- receive AI feedback
- rewrite explanations
- track understanding growth over time

## 3. Problem
Students often fail to:
- review lessons consistently
- verify whether they truly understood concepts
- analyze wrong answers meaningfully
- reflect on learning strategies

As a result, study time increases without proportional learning gains.

## 4. Target users
### Primary
High school students.

### Secondary
Teachers and tutors (not in MVP except light support for future expansion).

## 5. Product goals
- Build a daily review habit.
- Improve concept explanation ability.
- Strengthen metacognition.
- Surface weak concepts.
- Increase perceived learning progress.

## 6. UX principles
- Start in 3 seconds.
- Finish Daily Review in 5 minutes.
- Minimal typing.
- Supportive feedback, never harsh evaluation.
- Focus on understanding rather than raw time spent.

## 7. MVP features
1. Dashboard
2. Daily Review
3. Explain -> Feedback -> Rewrite loop
4. Question generation field
5. Wrong answer analysis
6. Learning streak
7. Understanding growth graph
8. Concept mastery view (basic)
9. Weekly review

## 8. Core flow
Lesson -> Daily Review -> Explanation -> AI Feedback -> Rewrite -> Growth

## 9. Dashboard requirements
The dashboard should show:
- current streak
- CTA to start today's review
- understanding growth summary
- weak concepts / recommended concept to revisit

## 10. Daily Review requirements
Fields:
- subject
- lesson topic
- 1 to 3 key concepts
- explanation in student's own words
- 1 to 3 student-generated questions
- wrong problem count or wrong problem note
- wrong answer reason(s)
- next thing to review (optional)

Expected completion time: 3 to 5 minutes.

## 11. AI evaluation requirements
The AI evaluates student explanation on:
- concept correctness
- key concept coverage
- explanation difficulty
- whether there appears to be misunderstanding
- whether metacognition appears weak (when signals exist)

Difficulty levels:
- elementary
- middle school
- high school

Feedback policy:
- elementary: excellent, very easy to understand
- middle school: good, clear enough
- high school: still acceptable but suggest simplification
- misunderstanding or missing concepts: provide corrective guidance
- weak metacognition: encourage more specific reflection

The AI must return structured JSON.

## 12. AI output schema
Minimum fields:
- score: 1-5
- difficulty: elementary | middle_school | high_school | weak | incorrect
- feedback_summary: string
- strengths: string[]
- improvements: string[]
- missing_concepts: string[]
- misconception_flags: string[]
- metacognition_flags: string[]
- rewrite_prompt: string

## 13. Learning streak
- Completing Daily Review for a date increments streak.
- Missing a day resets streak.
- Define timezone explicitly in implementation.

## 14. Understanding score
Suggested mapping:
- elementary = 5
- middle_school = 4
- high_school = 3
- weak = 2
- incorrect = 1

## 15. Concept mastery
Each concept should have a simple mastery score.
Recommended MVP range: 1-5.
Sources may include:
- explanation score
- rewrite success
- repeated review

## 16. Weekly review
Weekly review should capture:
- most important concepts this week
- most common wrong answer pattern
- hardest concept this week
- next week's study strategy

## 17. Recommended stack
- Next.js
- React
- TailwindCSS
- Supabase/Postgres
- OpenAI API

## 18. Data model summary
### User
- id
- email
- grade
- created_at

### StudyLog
- id
- user_id
- review_date
- subject
- topic
- concepts[]
- explanation_initial
- explanation_rewritten
- questions[]
- wrong_answer_reasons[]
- next_review_note
- ai_score
- ai_difficulty
- ai_feedback_json
- created_at

### Concept
- id
- subject
- name

### ConceptMastery
- id
- user_id
- concept_id
- score
- last_reviewed_at
- review_count

### WeeklyReview
- id
- user_id
- week_start_date
- key_concepts[]
- hardest_concept
- common_error_pattern
- next_strategy

## 19. Success metrics
- Daily review completion rate
- Rewrite rate
- 7-day retention
- Average streak length
- Weekly review completion

## 20. Non-goals for MVP
- teacher dashboard
- class management
- real-time collaboration
- full gamification system
