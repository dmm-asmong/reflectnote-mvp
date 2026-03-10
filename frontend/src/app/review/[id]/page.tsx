import { getReviewDetail } from "@backend/services/reviews";

import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { ReviewFeedbackPanel } from "@/components/review/review-feedback-panel";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { requireUserId } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ReviewDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const { id } = await params;
  const userId = await requireUserId();
  const supabase = await getSupabaseServerClient();
  const review = await getReviewDetail(supabase, userId, id);

  return (
    <div className="grid gap-4">
      <PageHeader
        eyebrow="설명 피드백"
        title={review.topic}
        description="AI가 이해한 내용과 보완할 점을 확인한 뒤, 더 쉽고 짧은 설명으로 다시 정리해보세요."
      />
      <SectionCard title="처음 쓴 설명" eyebrow={review.subject}>
        <p className="text-sm leading-7 text-[var(--text-soft)]">{review.explanationInitial}</p>
      </SectionCard>
      <ReviewFeedbackPanel reviewId={review.id} feedback={review.aiFeedback} rewrittenExplanation={review.explanationRewritten} />
    </div>
  );
}
