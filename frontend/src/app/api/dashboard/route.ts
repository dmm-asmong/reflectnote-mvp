import { NextResponse } from "next/server";

import { getDashboardSummary } from "@backend/services/dashboard";

import { getOptionalUserId } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const userId = await getOptionalUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();
  const summary = await getDashboardSummary(supabase, userId);

  return NextResponse.json(summary);
}
