import { NextResponse } from "next/server";

import { createWeeklyReview } from "@backend/services/weekly-reviews";

import { getOptionalUserId } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const userId = await getOptionalUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as {
    keyConcepts?: string[];
    hardestConcept?: string;
    commonErrorPattern?: string;
    nextStrategy?: string;
  };

  const supabase = await getSupabaseServerClient();
  const review = await createWeeklyReview(supabase, {
    userId,
    keyConcepts: body.keyConcepts ?? [],
    hardestConcept: body.hardestConcept ?? "",
    commonErrorPattern: body.commonErrorPattern ?? "",
    nextStrategy: body.nextStrategy ?? "",
  });

  return NextResponse.json(review, { status: 201 });
}
