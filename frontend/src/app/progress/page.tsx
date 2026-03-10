import { getProgressSummary } from "@backend/services/progress";

import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { requireUserId } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function ProgressPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const userId = await requireUserId();
  const supabase = await getSupabaseServerClient();
  const summary = await getProgressSummary(supabase, userId);

  return <ProgressOverview summary={summary} />;
}
