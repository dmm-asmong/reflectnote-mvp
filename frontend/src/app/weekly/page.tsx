import { getLatestWeeklyReview } from "@backend/services/weekly-reviews";

import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { WeeklyReviewPanel } from "@/components/weekly/weekly-review-panel";
import { requireUserId } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function WeeklyPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const userId = await requireUserId();
  const supabase = await getSupabaseServerClient();
  const review = await getLatestWeeklyReview(supabase, userId);

  return <WeeklyReviewPanel review={review} />;
}
