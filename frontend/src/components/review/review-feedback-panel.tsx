"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import type { AiEvaluationResult } from "@backend/types/ai";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { TagList } from "@/components/ui/tag-list";

type ReviewFeedbackPanelProps = {
  reviewId: string;
  feedback: AiEvaluationResult;
  rewrittenExplanation?: string | null;
};

export function ReviewFeedbackPanel({ reviewId, feedback, rewrittenExplanation }: ReviewFeedbackPanelProps) {
  const router = useRouter();
  const [rewriteText, setRewriteText] = useState(rewrittenExplanation ?? "");
  const [isDone, setIsDone] = useState(!!rewrittenExplanation);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveRewrite() {
    setErrorMessage("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/rewrite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ explanationRewritten: rewriteText }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorPayload.error ?? "다시 쓴 설명을 저장하지 못했습니다.");
      }

      setIsDone(true);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "다시 쓴 설명을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-4">
      <SectionCard title="AI 피드백" eyebrow="격려와 코칭" action={<StatusPill label={`이해 점수 ${feedback.score}/5`} tone="warm" />}>
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl bg-gradient-to-br from-accent to-accent-strong p-5 text-accent-darker shadow-strong">
            <p className="text-base font-semibold leading-8 tracking-tight">{feedback.feedbackSummary}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-accent-dark">잘한 점</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-7 text-accent-darker/80">
                  {feedback.strengths.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-accent-dark">다음에 보완할 점</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-7 text-accent-darker/80">
                  {feedback.improvements.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-3xl bg-surface-dark p-5 text-white">
              <p className="text-sm font-semibold text-accent">빠진 개념</p>
              <div className="mt-3">
                <TagList items={feedback.missingConcepts.length > 0 ? feedback.missingConcepts : ["큰 누락은 아직 보이지 않아요"]} tone="accent" />
              </div>
            </div>
            <div className="rounded-3xl bg-surface-muted p-5 text-ink">
              <p className="text-sm font-semibold">메타인지 코칭</p>
              <div className="mt-3">
                <TagList items={feedback.metacognitionFlags.length > 0 ? feedback.metacognitionFlags : ["복습 포인트를 비교적 구체적으로 잡았어요"]} />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="다시 써보기" eyebrow="더 쉬운 말로 다시 설명">
        <div className="rounded-3xl bg-surface-muted p-5">
          <p className="text-sm leading-7 text-ink-soft">{feedback.rewritePrompt}</p>
        </div>
        {isDone ? (
          <div className="mt-4 rounded-3xl bg-gradient-to-br from-accent to-accent-strong p-6 text-center text-accent-darker">
            <p className="text-lg font-semibold tracking-tight">오늘의 복습 루프 완료!</p>
            <p className="mt-2 text-sm leading-7 text-accent-darker/80">
              설명하고, 피드백 받고, 다시 썼어요. 개념 숙달도가 업데이트됐습니다.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <LinkButton href="/" tone="primary">대시보드로 돌아가기</LinkButton>
              <LinkButton href="/progress" tone="secondary">이해도 확인하기</LinkButton>
            </div>
          </div>
        ) : (
          <>
            <textarea
              className="mt-4 min-h-28 sm:min-h-44 w-full rounded-3xl border border-black/10 bg-surface px-5 py-5 text-sm leading-7 text-ink shadow-sm"
              onChange={(event) => setRewriteText(event.target.value)}
              placeholder="방금 받은 피드백을 참고해서, 더 쉽고 짧은 문장으로 다시 설명해보세요."
              value={rewriteText}
            />
            {errorMessage ? <p className="mt-3 text-sm text-status-error">{errorMessage}</p> : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button disabled={isSaving} onClick={handleSaveRewrite} type="button">
                {isSaving ? "저장 중..." : "다시 쓴 설명 저장"}
              </Button>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
