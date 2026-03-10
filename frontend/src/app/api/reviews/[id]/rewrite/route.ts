import { NextResponse } from "next/server";

import { saveRewrite } from "@backend/services/reviews";

import { getOptionalUserId } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const userId = await getOptionalUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();
  const { id } = await params;
  const body = (await request.json()) as { explanationRewritten?: string };
  const result = await saveRewrite(supabase, userId, id, body.explanationRewritten ?? "");

  return NextResponse.json(result);
}
