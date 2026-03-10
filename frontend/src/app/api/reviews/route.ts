import { NextResponse } from "next/server";

import { createOrUpdateReviewDraft } from "@backend/services/reviews";
import { parseReviewDraftInput } from "@backend/validation/review";

import { getOptionalUserId } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const userId = await getOptionalUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();
  const body = await request.json();
  const input = parseReviewDraftInput({ ...body, userId });
  const review = await createOrUpdateReviewDraft(supabase, input);

  return NextResponse.json(review, { status: 201 });
}
