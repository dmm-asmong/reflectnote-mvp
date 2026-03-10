import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@backend/supabase/admin";
import { evaluateReviewExplanation } from "@backend/services/reviews";

import { getOptionalUserId } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const userId = await getOptionalUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { id } = await params;
    const evaluation = await evaluateReviewExplanation(supabase, userId, id);
    return NextResponse.json(evaluation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 피드백을 처리하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
