"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { WeeklyReviewSummary } from "@backend/types/review";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { TagList } from "@/components/ui/tag-list";

type WeeklyReviewPanelProps = {
  review: WeeklyReviewSummary;
};

const strategySuggestions = ["백지에서 다시 설명하기", "비슷한 개념 비교하기", "여러 단계 문제 천천히 풀기", "핵심 용어 먼저 확인하기"];

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function WeeklyReviewPanel({ review }: WeeklyReviewPanelProps) {
  const router = useRouter();
  const [keyConcepts, setKeyConcepts] = useState<string[]>(review.keyConcepts);
  const [hardestConcept, setHardestConcept] = useState(review.hardestConcept);
  const [commonErrorPattern, setCommonErrorPattern] = useState(review.commonErrorPattern);
  const [nextStrategy, setNextStrategy] = useState(review.nextStrategy);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function toggleConcept(concept: string) {
    if (keyConcepts.includes(concept)) {
      setKeyConcepts(keyConcepts.filter((item) => item !== concept));
      return;
    }

    if (keyConcepts.length >= 3) {
      return;
    }

    setKeyConcepts([...keyConcepts, concept]);
  }

  function applyStrategySuggestion(suggestion: string) {
    const strategies = splitLines(nextStrategy);

    if (strategies.includes(suggestion)) {
      setNextStrategy(strategies.filter((item) => item !== suggestion).join("\n"));
      return;
    }

    if (strategies.length >= 3) {
      return;
    }

    setNextStrategy([...strategies, suggestion].join("\n"));
  }

  async function handleSave() {
    setStatusMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/weekly-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyConcepts,
          hardestConcept,
          commonErrorPattern,
          nextStrategy,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorPayload.error ?? "주간 회고를 저장하지 못했습니다.");
      }

      setStatusMessage("주간 회고를 저장했어요.");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "주간 회고를 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-4">
      <PageHeader
        eyebrow="주간 회고"
        title="이번 주 학습 흐름을 짧게 정리해보세요."
        description="가장 중요했던 개념, 가장 자주 반복된 실수, 다음 주에 바로 실천할 전략 하나면 충분합니다."
        action={<StatusPill label="목표 3분" tone="good" />}
      />

      <SectionCard title="이번 주 회고" eyebrow={review.weekLabel}>
        <div className="grid gap-5">
          <div className="grid gap-3 rounded-3xl bg-surface-muted p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">가장 중요했던 개념</p>
              <span className="text-xs text-ink-soft">{keyConcepts.length}/3</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {review.recentConcepts.length > 0 ? (
                review.recentConcepts.map((concept: string) => {
                  const active = keyConcepts.includes(concept);
                  return (
                    <button
                      key={concept}
                      type="button"
                      className={`rounded-full px-4 py-2 text-sm ${active ? "bg-white text-ink" : "bg-white/65 text-ink-soft"}`}
                      onClick={() => toggleConcept(concept)}
                    >
                      {concept}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-ink-soft">이번 주 복습 기록이 없어요. 개념을 직접 입력해보세요.</p>
              )}
            </div>
            <TagList items={keyConcepts.length > 0 ? keyConcepts : ["최대 세 개까지 고를 수 있어요"]} tone="accent" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">이번 주 가장 어려웠던 개념</span>
              <input
                className="rounded-2xl border border-white/10 bg-surface px-4 py-3 text-ink"
                value={hardestConcept}
                onChange={(event) => setHardestConcept(event.target.value)}
                placeholder="어디에서 이해가 가장 흔들렸는지 적어보세요"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">가장 자주 반복된 오답 패턴</span>
              <input
                className="rounded-2xl border border-white/10 bg-surface px-4 py-3 text-ink"
                value={commonErrorPattern}
                onChange={(event) => setCommonErrorPattern(event.target.value)}
                placeholder="어떤 실수가 반복됐는지 짧게 적어보세요"
              />
            </label>
          </div>

          <div className="grid gap-3 rounded-3xl border border-dashed border-white/20 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">다음 주 학습 전략</p>
              <span className="text-xs text-ink-soft">실제로 할 수 있게 구체적으로</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {strategySuggestions.map((suggestion) => {
                const active = splitLines(nextStrategy).includes(suggestion);
                return (
                  <button
                    key={suggestion}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm ${active ? "bg-accent-soft text-accent-strong" : "bg-surface-muted text-ink-soft"}`}
                    onClick={() => applyStrategySuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                );
              })}
            </div>
            <textarea
              className="min-h-20 sm:min-h-28 rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm leading-6 text-ink"
              value={nextStrategy}
              onChange={(event) => setNextStrategy(event.target.value)}
              placeholder="다음 주에 실제로 지킬 전략을 한두 줄로 적어보세요"
            />
          </div>

          {statusMessage ? <p className="text-sm text-status-success">{statusMessage}</p> : null}
          {errorMessage ? <p className="text-sm text-status-error">{errorMessage}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "저장 중..." : "주간 회고 저장"}
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
