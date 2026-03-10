import type { ProgressSummary } from "@backend/types/review";

import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";

type ProgressOverviewProps = {
  summary: ProgressSummary;
};

const difficultyLabels = [
  { score: 5, label: "아주 쉽게 설명 가능" },
  { score: 4, label: "중학생 눈높이로 설명 가능" },
  { score: 3, label: "조금 더 단순화 필요" },
  { score: 2, label: "핵심 개념 보강 필요" },
  { score: 1, label: "개념 오해 가능성 높음" },
];

export function ProgressOverview({ summary }: ProgressOverviewProps) {
  const latestScore = summary.growthPoints[summary.growthPoints.length - 1]?.score ?? 0;

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="이해도"
        title="설명이 얼마나 쉬워졌는지 확인하세요."
        description="점수 자체보다, 설명이 더 또렷하고 쉬워지고 있는지와 어떤 개념이 반복 복습이 필요한지를 같이 보여줍니다."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="최근 점수" value={`${latestScore}/5`} hint="설명 난이도를 이해도 점수로 바꿔 보여줍니다." />
        <StatCard label="기록된 복습" value={`${summary.growthPoints.length}회`} hint="저장된 일일 복습마다 한 점이 생깁니다." />
        <StatCard label="추적 중인 개념" value={`${summary.mastery.length}개`} hint="가장 기본적인 개념 숙달도만 보여줍니다." />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <SectionCard title="이해도 변화" eyebrow="최근 설명 흐름" className="h-full">
          <div className="grid gap-4 max-h-[360px] sm:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {summary.growthPoints.map((point, index) => (
              <div key={point.date} className="grid gap-2 rounded-3xl bg-surface p-5 text-ink">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink-soft">{point.date}</span>
                  <span className="text-sm font-semibold">{point.score}/5</span>
                </div>
                <div className="h-3 rounded-full bg-black/5">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-accent-deep to-accent"
                    style={{ width: `${(point.score / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-ink-soft">기록 {index + 1}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {difficultyLabels.map((item) => (
              <StatusPill key={item.label} label={`${item.score}점 · ${item.label}`} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="개념 숙달도" eyebrow="반복 복습 현황" className="h-full">
          <div className="grid gap-3 max-h-[360px] sm:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {summary.mastery.map((concept) => (
              <div key={concept.name} className="rounded-3xl bg-surface-dark p-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{concept.name}</p>
                  <StatusPill label={`${concept.score}/5`} tone="good" />
                </div>
                <p className="mt-2 text-sm text-white/60">총 {concept.reviewCount}번 다시 봤어요</p>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-accent to-accent-soft" style={{ width: `${(concept.score / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
