import { getDraftForToday } from "@backend/services/reviews";

import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { DailyReviewForm } from "@/components/review/daily-review-form";
import { requireUserId } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function DailyReviewPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const userId = await requireUserId();
  const supabase = await getSupabaseServerClient();
  const draft = await getDraftForToday(supabase, userId);

  return <DailyReviewForm initialDraft={draft} />;
}
