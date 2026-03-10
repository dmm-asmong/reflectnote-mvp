import { getDashboardSummary } from "@backend/services/dashboard";

import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { requireUserId } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  const userId = await requireUserId();
  const supabase = await getSupabaseServerClient();
  const summary = await getDashboardSummary(supabase, userId);

  return <DashboardOverview summary={summary} />;
}
