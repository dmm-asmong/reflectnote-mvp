import { NextResponse } from "next/server";

import { getProgressSummary } from "@backend/services/progress";

import { getOptionalUserId } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const userId = await getOptionalUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();
  const summary = await getProgressSummary(supabase, userId);

  return NextResponse.json(summary);
}
