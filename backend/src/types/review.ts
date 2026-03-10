import type { AiEvaluationResult, DifficultyLevel } from "./ai";

export type StudyLogStatus = "draft" | "submitted" | "evaluated" | "rewritten";

export type StudyLogDraft = {
  reviewDate: string;
  subject: string;
  topic: string;
  concepts: string[];
  explanationInitial: string;
  questions: string[];
  wrongProblemNote: string | null;
  wrongAnswerReasons: string[];
  nextReviewNote: string | null;
  timezone: string;
};

export type StudyLog = StudyLogDraft & {
  id: string;
  userId: string;
  status: StudyLogStatus;
  explanationRewritten: string | null;
  aiDifficulty: DifficultyLevel | null;
  aiScore: number | null;
  aiFeedback: AiEvaluationResult;
  createdAt: string;
};

export type ReviewDraftInput = StudyLogDraft & {
  userId: string;
};

export type DashboardSummary = {
  currentStreak: number;
  todayCtaLabel: string;
  growthTrend: string;
  growthSummary: string;
  recommendedConcept: {
    name: string;
    reason: string;
  };
};

export type ProgressPoint = {
  date: string;
  score: number;
};

export type ConceptMasterySummary = {
  name: string;
  score: number;
  reviewCount: number;
};

export type ProgressSummary = {
  growthPoints: ProgressPoint[];
  mastery: ConceptMasterySummary[];
};

export type WeeklyReviewInput = {
  userId?: string;
  keyConcepts: string[];
  hardestConcept: string;
  commonErrorPattern: string;
  nextStrategy: string;
};

export type WeeklyReviewSummary = WeeklyReviewInput & {
  id: string;
  weekLabel: string;
  recentConcepts: string[];
};

export type UserProfile = {
  id: string;
  email: string;
  grade: string | null;
  createdAt: string;
};
