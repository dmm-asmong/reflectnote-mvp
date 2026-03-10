"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import type { StudyLogDraft } from "@backend/types/review";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { TagList } from "@/components/ui/tag-list";

type DailyReviewFormProps = {
  initialDraft: StudyLogDraft;
};

type SaveReviewResponse = {
  id: string;
  status: string;
  reviewDate: string;
};

const subjectOptions = ["국어", "수학", "영어", "과학", "사회"];

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function DailyReviewForm({ initialDraft }: DailyReviewFormProps) {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState(initialDraft.subject || subjectOptions[0]);
  const [topic, setTopic] = useState(initialDraft.topic);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>(initialDraft.concepts);
  const [explanation, setExplanation] = useState(initialDraft.explanationInitial);
  const [questionText, setQuestionText] = useState(initialDraft.questions.join("\n"));
  const [reasonText, setReasonText] = useState(initialDraft.wrongAnswerReasons.join("\n"));
  const [nextReviewNote, setNextReviewNote] = useState(initialDraft.nextReviewNote ?? "");
  const [wrongProblemNote, setWrongProblemNote] = useState(initialDraft.wrongProblemNote ?? "");
  const [conceptInput, setConceptInput] = useState("");
  const [showWrongProblems, setShowWrongProblems] = useState(
    !!(initialDraft.wrongProblemNote || initialDraft.wrongAnswerReasons.length > 0)
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalStep, setEvalStep] = useState<"saving" | "analyzing">("saving");

  const conceptSuggestions = ["핵심 정의", "작동 원리", "공식 또는 규칙", "자주 헷갈리는 부분"];
  const questionSuggestions = ["왜 이렇게 되는지", "조건이 바뀌면 어떻게 되는지", "어느 단계가 가장 중요한지"];
  const reasonSuggestions = ["용어를 헷갈림", "중간 단계를 건너뜀", "급하게 풂", "근거 없이 찍음"];

  const selectedQuestions = splitLines(questionText);
  const selectedReasons = splitLines(reasonText);

  function toggleItem(value: string, items: string[], setItems: (next: string[]) => void, limit: number) {
    if (items.includes(value)) {
      setItems(items.filter((item) => item !== value));
      return;
    }

    if (items.length >= limit) {
      return;
    }

    setItems([...items, value]);
  }

  function handleAddConcept(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const val = conceptInput.trim();
      if (val && !selectedConcepts.includes(val) && selectedConcepts.length < 3) {
        setSelectedConcepts([...selectedConcepts, val]);
        setConceptInput("");
      }
    }
  }

  function toggleQuestion(value: string) {
    const nextItems = [...selectedQuestions];

    if (nextItems.includes(value)) {
      setQuestionText(nextItems.filter((item) => item !== value).join("\n"));
      return;
    }

    if (nextItems.length >= 3) {
      return;
    }

    setQuestionText([...nextItems, value].join("\n"));
  }

  function toggleReason(value: string) {
    const nextItems = [...selectedReasons];

    if (nextItems.includes(value)) {
      setReasonText(nextItems.filter((item) => item !== value).join("\n"));
      return;
    }

    if (nextItems.length >= 3) {
      return;
    }

    setReasonText([...nextItems, value].join("\n"));
  }

  function buildPayload() {
    return {
      reviewDate: initialDraft.reviewDate,
      subject: selectedSubject,
      topic,
      concepts: selectedConcepts,
      explanationInitial: explanation,
      questions: selectedQuestions,
      wrongProblemNote,
      wrongAnswerReasons: selectedReasons,
      nextReviewNote,
      timezone: initialDraft.timezone,
    };
  }

  async function saveReview() {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildPayload()),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(errorPayload.error ?? "복습 내용을 저장하지 못했습니다.");
    }

    return (await response.json()) as SaveReviewResponse;
  }

  async function handleSaveDraft() {
    setErrorMessage("");
    setStatusMessage("");
    setIsSaving(true);

    try {
      await saveReview();
      setStatusMessage("임시 저장했어요.");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "임시 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEvaluate() {
    setErrorMessage("");
    setStatusMessage("");
    setIsEvaluating(true);
    setEvalStep("saving");

    try {
      const saved = await saveReview();
      setEvalStep("analyzing");
      const evaluateResponse = await fetch(`/api/reviews/${saved.id}/evaluate`, {
        method: "POST",
      });

      if (!evaluateResponse.ok) {
        let errorMsg = "AI 피드백을 가져오지 못했습니다.";
        try {
          const errorPayload = await evaluateResponse.json();
          errorMsg = errorPayload.error || errorMsg;
        } catch { }
        throw new Error(errorMsg);
      }

      router.push(`/review/${saved.id}`);
      // 성공 시 isEvaluating 초기화 안 함 — 페이지 전환 중에도 오버레이 유지
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "AI 피드백을 가져오지 못했습니다.");
      setIsEvaluating(false);
    }
  }

  return (
    <div className="grid gap-4">
      {isEvaluating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-[34px] border border-black/10 bg-surface p-8 shadow-strong text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
            <p className="text-base font-semibold text-ink">
              {evalStep === "saving" ? "복습 내용을 저장하고 있어요" : "AI가 설명을 분석하고 있어요"}
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              {evalStep === "saving" ? "잠깐만요..." : "보통 5~10초 걸려요. 잠시만 기다려주세요."}
            </p>
          </div>
        </div>
      )}
      <PageHeader
        eyebrow="오늘의 복습"
        title="5분 안에 오늘의 이해를 남겨보세요."
        description="과목을 고르고, 핵심 개념을 찍고, 내 말로 짧게 설명하면 됩니다. 필요한 입력만 남겨 AI 피드백까지 빠르게 이어집니다."
        action={<StatusPill label="목표 3~5분" tone="warm" />}
      />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <SectionCard title="1. 오늘 배운 범위 고르기" eyebrow="빠른 시작" className="h-full">
          <div className="grid gap-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">과목</p>
                <span className="text-xs text-ink-soft">가볍게 하나만 고르면 됩니다</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {subjectOptions.map((subject, index) => {
                  const active = subject === selectedSubject;
                  return (
                    <button
                      key={`${subject}-${index}`}
                      className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${active ? "bg-surface-dark text-white shadow-md" : "bg-surface-muted text-ink-soft"}`}
                      onClick={(event) => {
                        event.preventDefault();
                        setSelectedSubject(subject);
                      }}
                      type="button"
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">단원 또는 주제</span>
              <input
                className="rounded-3xl border border-black/10 bg-surface px-4 py-3 text-ink shadow-sm"
                name="topic"
                onChange={(event) => setTopic(event.target.value)}
                placeholder="광합성의 명반응"
                value={topic}
              />
            </label>

            <div className="rounded-3xl bg-surface-muted p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">핵심 개념 1~3개</p>
                <span className="text-xs text-ink-soft">{selectedConcepts.length}/3 선택</span>
              </div>
              <label className="mt-3 block">
                <input
                  className="w-full rounded-2xl border border-black/10 bg-surface px-4 py-2 text-sm text-ink shadow-sm"
                  onKeyDown={handleAddConcept}
                  onChange={(e) => setConceptInput(e.target.value)}
                  value={conceptInput}
                  placeholder="직접 입력 후 Enter (예: 관성의 법칙)"
                  disabled={selectedConcepts.length >= 3}
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {conceptSuggestions.map((concept, index) => {
                  const active = selectedConcepts.includes(concept);
                  return (
                    <button
                      key={`${concept}-${index}`}
                      className={`rounded-2xl px-3 py-1.5 text-xs transition ${active ? "bg-surface-dark text-white shadow-sm" : "bg-surface text-ink-soft shadow-sm hover:bg-black/5"}`}
                      onClick={(event) => {
                        event.preventDefault();
                        toggleItem(concept, selectedConcepts, setSelectedConcepts, 3);
                      }}
                      type="button"
                    >
                      {concept}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedConcepts.length > 0 ? (
                  selectedConcepts.map((item, index) => (
                    <button
                      key={`selected-${item}-${index}`}
                      type="button"
                      onClick={() => toggleItem(item, selectedConcepts, setSelectedConcepts, 3)}
                      className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent hover:opacity-80"
                    >
                      {item} <span className="text-accent-dark/50">✕</span>
                    </button>
                  ))
                ) : (
                  <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft">
                    최대 세 개까지 추가해보세요
                  </span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="2. 내 말로 설명하기" eyebrow="핵심 입력" className="h-full">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">설명</span>
            <textarea
              className="min-h-32 sm:min-h-52 rounded-3xl border border-black/10 bg-surface px-5 py-5 text-sm leading-7 text-ink shadow-sm"
              name="explanationInitial"
              onChange={(event) => setExplanation(event.target.value)}
              placeholder="이 개념을 이해했다는 게 드러날 만큼만, 2~4문장으로 짧게 써보세요."
              value={explanation}
            />
            <span className="text-xs text-ink-soft">길게 쓰기보다, 쉽고 분명하게 쓰는 게 더 중요합니다.</span>
          </label>

          <div className="mt-5 grid gap-4">
            <div className="rounded-3xl bg-surface-dark p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-accent">아직 헷갈리는 질문</p>
                <span className="text-xs text-white/50">{selectedQuestions.length}/3</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {questionSuggestions.map((item, index) => {
                  const active = selectedQuestions.includes(item);
                  return (
                    <button
                      key={`${item}-${index}`}
                      className={`rounded-2xl px-4 py-2 text-sm transition ${active ? "bg-accent text-accent-darker font-medium" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                      onClick={(event) => {
                        event.preventDefault();
                        toggleQuestion(item);
                      }}
                      type="button"
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <textarea
                className="mt-4 min-h-20 sm:min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white placeholder:text-white/40 focus:border-accent"
                name="questions"
                onChange={(event) => setQuestionText(event.target.value)}
                placeholder="위 칩에 없는 질문이 있다면 짧게 적어도 됩니다."
                value={questionText}
              />
            </div>

            {showWrongProblems ? (
              <div className="rounded-3xl bg-status-error/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">틀린 문제</p>
                  <button
                    type="button"
                    className="text-xs text-ink-soft hover:text-ink"
                    onClick={() => {
                      setShowWrongProblems(false);
                      setWrongProblemNote("");
                      setReasonText("");
                    }}
                  >
                    닫기
                  </button>
                </div>
                <label className="mt-3 grid gap-2">
                  <span className="text-xs text-ink-soft">틀린 문제 수 또는 메모</span>
                  <input
                    className="rounded-3xl border border-black/10 bg-surface px-4 py-3 text-ink shadow-sm"
                    name="wrongProblemNote"
                    onChange={(event) => setWrongProblemNote(event.target.value)}
                    placeholder="2문제, 용어를 자주 헷갈림"
                    value={wrongProblemNote}
                  />
                </label>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-ink-soft">틀린 이유</p>
                  <span className="text-xs text-ink-soft">{selectedReasons.length}/3</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {reasonSuggestions.map((item, index) => {
                    const active = selectedReasons.includes(item);
                    return (
                      <button
                        key={`${item}-${index}`}
                        className={`rounded-2xl px-4 py-2 text-sm transition ${active ? "bg-surface-dark text-white font-medium" : "bg-surface text-ink-soft shadow-sm hover:bg-black/5"}`}
                        onClick={(event) => {
                          event.preventDefault();
                          toggleReason(item);
                        }}
                        type="button"
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  className="mt-3 min-h-16 sm:min-h-20 w-full rounded-2xl border border-black/10 bg-surface px-4 py-3 text-sm leading-6 text-ink shadow-sm"
                  name="wrongAnswerReasons"
                  onChange={(event) => setReasonText(event.target.value)}
                  placeholder="왜 틀렸는지 짧게 적어두면 다음 피드백이 더 정확해집니다."
                  value={reasonText}
                />
              </div>
            ) : (
              <button
                type="button"
                className="rounded-3xl border border-dashed border-black/15 px-4 py-3 text-sm text-ink-soft transition hover:border-black/30 hover:text-ink"
                onClick={() => setShowWrongProblems(true)}
              >
                + 오늘 틀린 문제가 있어요
              </button>
            )}
          </div>

          <label className="mt-4 grid gap-2">
            <span className="text-sm font-semibold">다음에 다시 볼 것 (선택)</span>
            <input
              className="rounded-3xl border border-black/10 bg-surface px-4 py-3 text-ink shadow-sm"
              name="nextReviewNote"
              onChange={(event) => setNextReviewNote(event.target.value)}
              placeholder="ATP가 어디에 쓰이는지 다시 보기"
              value={nextReviewNote}
            />
          </label>
        </SectionCard>
      </div>

      {statusMessage ? <p className="text-sm text-status-warning">{statusMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-status-error">{errorMessage}</p> : null}

      <div className="sticky bottom-0 z-10 flex flex-col gap-2 rounded-t-3xl border border-black/10 bg-surface/95 p-3 shadow-strong backdrop-blur sm:flex-row sm:rounded-3xl sm:gap-3 sm:bottom-4">
        <Button disabled={isSaving || isEvaluating} onClick={handleSaveDraft} type="button" className="w-full sm:w-auto">
          {isSaving ? "저장 중..." : "임시 저장"}
        </Button>
        <Button disabled={isSaving || isEvaluating} onClick={handleEvaluate} tone="secondary" type="button" className="w-full sm:w-auto">
          {isEvaluating ? "피드백 불러오는 중..." : "AI 피드백 받기"}
        </Button>
      </div>
    </div>
  );
}
