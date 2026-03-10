import { evaluateExplanation } from "@ai/evaluate-explanation";
import { createFallbackEvaluation } from "@ai/fallbacks";
import { toStoredAiEvaluationResult } from "@ai/schema";

import { calculateMasteryScore } from "./mastery";
import { ensureUserProfile } from "./users";

import type { AiEvaluationResult } from "../types/ai";
import type { ReviewDraftInput, StudyLog, StudyLogDraft } from "../types/review";
import type { AppSupabaseClient } from "../types/supabase";

type StudyLogRow = {
  id: string;
  user_id: string;
  review_date: string;
  subject: string;
  topic: string;
  concepts: string[] | null;
  explanation_initial: string | null;
  explanation_rewritten: string | null;
  questions: string[] | null;
  wrong_problem_note: string | null;
  wrong_answer_reasons: string[] | null;
  next_review_note: string | null;
  timezone: string;
  status: "draft" | "submitted" | "evaluated" | "rewritten";
  ai_difficulty: string | null;
  ai_score: number | null;
  ai_feedback_json: {
    score?: 1 | 2 | 3 | 4 | 5;
    difficulty?: string;
    feedback_summary?: string;
    strengths?: string[];
    improvements?: string[];
    missing_concepts?: string[];
    misconception_flags?: string[];
    metacognition_flags?: string[];
    rewrite_prompt?: string;
  } | null;
  created_at: string;
};

function getTodayDateString(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function defaultDraft(reviewDate = getTodayDateString()): StudyLogDraft {
  return {
    reviewDate,
    subject: "",
    topic: "",
    concepts: [],
    explanationInitial: "",
    questions: [],
    wrongProblemNote: null,
    wrongAnswerReasons: [],
    nextReviewNote: null,
    timezone: process.env.REFLECTNOTE_DEFAULT_TIMEZONE ?? "Asia/Seoul",
  };
}

function mapStudyLogRow(row: StudyLogRow): StudyLog {
  return {
    id: row.id,
    userId: row.user_id,
    reviewDate: row.review_date,
    subject: row.subject,
    topic: row.topic,
    concepts: row.concepts ?? [],
    explanationInitial: row.explanation_initial ?? "",
    questions: row.questions ?? [],
    wrongProblemNote: row.wrong_problem_note,
    wrongAnswerReasons: row.wrong_answer_reasons ?? [],
    nextReviewNote: row.next_review_note,
    timezone: row.timezone,
    status: row.status,
    explanationRewritten: row.explanation_rewritten,
    aiDifficulty: (row.ai_difficulty as StudyLog["aiDifficulty"]) ?? null,
    aiScore: row.ai_score,
    aiFeedback: row.ai_feedback_json
      ? {
        score: row.ai_feedback_json.score ?? 2,
        difficulty: (row.ai_feedback_json.difficulty as AiEvaluationResult["difficulty"]) ?? "weak",
        feedbackSummary: row.ai_feedback_json.feedback_summary ?? "",
        strengths: row.ai_feedback_json.strengths ?? [],
        improvements: row.ai_feedback_json.improvements ?? [],
        missingConcepts: row.ai_feedback_json.missing_concepts ?? [],
        misconceptionFlags: row.ai_feedback_json.misconception_flags ?? [],
        metacognitionFlags: row.ai_feedback_json.metacognition_flags ?? [],
        rewritePrompt: row.ai_feedback_json.rewrite_prompt ?? "",
      }
      : createFallbackEvaluation(),
    createdAt: row.created_at,
  };
}

function mapStudyLogRowToDraft(row: Pick<StudyLogRow, "review_date" | "subject" | "topic" | "concepts" | "explanation_initial" | "questions" | "wrong_problem_note" | "wrong_answer_reasons" | "next_review_note" | "timezone">): StudyLogDraft {
  return {
    reviewDate: row.review_date,
    subject: row.subject,
    topic: row.topic,
    concepts: row.concepts ?? [],
    explanationInitial: row.explanation_initial ?? "",
    questions: row.questions ?? [],
    wrongProblemNote: row.wrong_problem_note,
    wrongAnswerReasons: row.wrong_answer_reasons ?? [],
    nextReviewNote: row.next_review_note,
    timezone: row.timezone,
  };
}

async function upsertConceptMasteryForEvaluation(
  supabase: AppSupabaseClient,
  userId: string,
  subject: string,
  concepts: string[],
  aiScore: number,
) {
  if (concepts.length === 0) {
    return;
  }

  const conceptRows = concepts.map((name) => ({ subject, name }));
  const { error: conceptUpsertError } = await supabase.from("concepts").upsert(conceptRows, { onConflict: "subject,name" });

  if (conceptUpsertError) {
    throw new Error(conceptUpsertError.message);
  }

  const { data: conceptData, error: conceptSelectError } = await supabase
    .from("concepts")
    .select("id, name")
    .eq("subject", subject)
    .in("name", concepts);

  if (conceptSelectError) {
    throw new Error(conceptSelectError.message);
  }

  for (const concept of conceptData) {
    const { data: existing, error: existingError } = await supabase
      .from("concept_mastery")
      .select("id, review_count")
      .eq("user_id", userId)
      .eq("concept_id", concept.id)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    const nextReviewCount = (existing?.review_count ?? 0) + 1;
    const nextScore = calculateMasteryScore({
      explanationScore: aiScore,
      rewriteCompleted: false,
      reviewCount: nextReviewCount,
    });

    const { error: masteryUpsertError } = await supabase.from("concept_mastery").upsert(
      {
        id: existing?.id,
        user_id: userId,
        concept_id: concept.id,
        score: nextScore,
        review_count: nextReviewCount,
        last_reviewed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,concept_id" },
    );

    if (masteryUpsertError) {
      throw new Error(masteryUpsertError.message);
    }
  }
}

async function applyRewriteBonusToConceptMastery(
  supabase: AppSupabaseClient,
  userId: string,
  subject: string,
  concepts: string[],
  aiScore: number,
) {
  if (concepts.length === 0) {
    return;
  }

  const { data: conceptData, error: conceptSelectError } = await supabase
    .from("concepts")
    .select("id, name")
    .eq("subject", subject)
    .in("name", concepts);

  if (conceptSelectError) {
    throw new Error(conceptSelectError.message);
  }

  for (const concept of conceptData) {
    const { data: existing, error: existingError } = await supabase
      .from("concept_mastery")
      .select("id, review_count")
      .eq("user_id", userId)
      .eq("concept_id", concept.id)
      .maybeSingle();

    if (existingError || !existing) {
      continue;
    }

    const boostedScore = calculateMasteryScore({
      explanationScore: aiScore,
      rewriteCompleted: true,
      reviewCount: existing.review_count,
    });

    const { error: updateError } = await supabase
      .from("concept_mastery")
      .update({
        score: boostedScore,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }
}

export async function getDraftForToday(supabase: AppSupabaseClient, userId: string): Promise<StudyLogDraft> {
  const reviewDate = getTodayDateString();
  const { data, error } = await supabase
    .from("study_logs")
    .select("review_date, subject, topic, concepts, explanation_initial, questions, wrong_problem_note, wrong_answer_reasons, next_review_note, timezone")
    .eq("user_id", userId)
    .eq("review_date", reviewDate)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return defaultDraft(reviewDate);
  }

  return mapStudyLogRowToDraft(data as Pick<StudyLogRow, "review_date" | "subject" | "topic" | "concepts" | "explanation_initial" | "questions" | "wrong_problem_note" | "wrong_answer_reasons" | "next_review_note" | "timezone">);
}

export async function createOrUpdateReviewDraft(supabase: AppSupabaseClient, input: ReviewDraftInput) {
  await ensureUserProfile(supabase, input.userId);

  const payload = {
    user_id: input.userId,
    review_date: input.reviewDate,
    subject: input.subject,
    topic: input.topic,
    concepts: input.concepts,
    explanation_initial: input.explanationInitial,
    questions: input.questions,
    wrong_problem_note: input.wrongProblemNote,
    wrong_answer_reasons: input.wrongAnswerReasons,
    next_review_note: input.nextReviewNote,
    timezone: input.timezone,
    status: input.explanationInitial ? "submitted" : "draft",
  };

  const { data, error } = await supabase
    .from("study_logs")
    .upsert(payload, { onConflict: "user_id,review_date" })
    .select("id, status, review_date")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    status: data.status,
    reviewDate: data.review_date,
  };
}

export async function getReviewDetail(supabase: AppSupabaseClient, userId: string, id: string): Promise<StudyLog> {
  const { data, error } = await supabase
    .from("study_logs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapStudyLogRow(data as StudyLogRow);
}

export async function evaluateReviewExplanation(
  supabase: AppSupabaseClient,
  userId: string,
  reviewId: string,
): Promise<AiEvaluationResult> {
  const review = await getReviewDetail(supabase, userId, reviewId);
  const evaluation = await evaluateExplanation({
    topic: review.topic,
    concepts: review.concepts,
    explanation: review.explanationInitial,
    questions: review.questions,
    wrongAnswerReasons: review.wrongAnswerReasons,
  });

  const { error } = await supabase
    .from("study_logs")
    .update({
      ai_score: evaluation.score,
      ai_difficulty: evaluation.difficulty,
      ai_feedback_json: toStoredAiEvaluationResult(evaluation),
      status: "evaluated",
    })
    .eq("id", reviewId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  await upsertConceptMasteryForEvaluation(supabase, userId, review.subject, review.concepts, evaluation.score);

  return evaluation;
}

export async function saveRewrite(
  supabase: AppSupabaseClient,
  userId: string,
  reviewId: string,
  explanationRewritten: string,
) {
  const { data: review, error: reviewError } = await supabase
    .from("study_logs")
    .select("ai_score, subject, concepts")
    .eq("id", reviewId)
    .eq("user_id", userId)
    .single();

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  const { error } = await supabase
    .from("study_logs")
    .update({
      explanation_rewritten: explanationRewritten,
      status: "rewritten",
    })
    .eq("id", reviewId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (typeof review.ai_score === "number") {
    await applyRewriteBonusToConceptMastery(supabase, userId, review.subject, review.concepts ?? [], review.ai_score);
  }

  return {
    reviewId,
    explanationRewritten,
    status: "rewritten" as const,
  };
}


