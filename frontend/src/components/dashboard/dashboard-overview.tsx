import type { DashboardSummary } from "@backend/types/review";

import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { TagList } from "@/components/ui/tag-list";

type DashboardOverviewProps = {
  summary: DashboardSummary;
};

const todayChecklist = ["과목 고르기", "핵심 개념 1~3개", "짧게 설명하기", "헷갈린 점 남기기"];

export function DashboardOverview({ summary }: DashboardOverviewProps) {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="대시보드"
        title="오늘의 이해 점검을 3초 안에 시작해요."
        description="긴 일지 대신, 핵심 개념을 짧게 설명하고 피드백을 받아 다시 써보는 흐름만 남겼습니다. 입력은 적게, 이해 확인은 선명하게 가져갑니다."
        action={<LinkButton href="/review">오늘의 복습 시작</LinkButton>}
      />

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-[34px] border border-black/10 bg-surface p-6 shadow-strong sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-widest text-accent-strong">오늘 바로 할 일</p>
              <h3 className="mt-2 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                {summary.todayCtaLabel}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-ink-soft">
                과목, 단원, 핵심 개념, 설명만 쓰면 바로 AI 피드백으로 이어집니다. 길게 쓰는 대신, 내가 진짜 이해했는지가 드러나게 짧고 또렷하게 남기면 됩니다.
              </p>
            </div>
            <div className="shrink-0">
              <StatusPill label={`${summary.currentStreak}일 연속`} tone="warm" />
            </div>
          </div>
          <div className="mt-6">
            <TagList items={todayChecklist} tone="default" />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="/review" tone="primary">복습 시작하기</LinkButton>
            <LinkButton href="/progress" tone="secondary">
              이해도 흐름 보기
            </LinkButton>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          <StatCard label="현재 스트릭" value={`${summary.currentStreak}일`} hint="하루 복습을 마치면 이어집니다." />
          <StatCard label="오늘 목표" value="5분 이내" hint="짧고 또렷하게." />
          <StatCard label="이해도 흐름" value={summary.growthTrend} hint={summary.growthSummary} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="오늘 집중할 이유" eyebrow="제품 원칙">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-surface-dark p-5 text-white">
              <p className="text-sm font-semibold text-accent">기록보다 이해</p>
              <p className="mt-3 text-sm leading-7 text-white/80">
                ReflectNote는 오래 공부했다는 사실보다, 배운 개념을 내 말로 쉽게 설명할 수 있는지에 집중합니다.
              </p>
            </div>
            <div className="rounded-3xl bg-surface-muted p-5 text-ink">
              <p className="text-sm font-semibold">짧게, 자주</p>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                복습은 길게 쓰는 숙제가 아니라, 매일 빠르게 이해를 점검하는 작은 루프여야 유지됩니다.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="다시 볼 개념" eyebrow="추천 개념">
          <div className="rounded-3xl bg-surface-muted p-5 text-ink">
            <p className="text-lg font-semibold">{summary.recommendedConcept.name}</p>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{summary.recommendedConcept.reason}</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-ink-soft">
            오늘 설명을 한 번 더 다듬고 이 개념을 다시 보면, 다음 복습에서 더 쉽게 설명할 가능성이 커집니다.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
