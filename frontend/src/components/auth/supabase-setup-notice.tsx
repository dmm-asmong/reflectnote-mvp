import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export function SupabaseSetupNotice() {
  return (
    <div className="grid gap-4">
      <PageHeader
        eyebrow="설정 필요"
        title="Supabase 환경 변수가 아직 비어 있어요."
        description="frontend/.env.local에 Supabase URL과 키를 넣고 새로고침하면, 보호된 MVP 화면에서 실제 데이터를 불러올 수 있습니다."
      />

      <SectionCard title="필수 변수" eyebrow="frontend/.env.local">
        <div className="grid gap-3 text-sm leading-6 text-[var(--text-soft)]">
          <p>`NEXT_PUBLIC_SUPABASE_URL`</p>
          <p>`NEXT_PUBLIC_SUPABASE_ANON_KEY`</p>
          <p>`SUPABASE_SERVICE_ROLE_KEY`</p>
          <p>`OPENAI_API_KEY`</p>
        </div>
      </SectionCard>
    </div>
  );
}
