import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

function sanitizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/";
  }

  return nextPath;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = sanitizeNextPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const errorDescription = url.searchParams.get("error_description");

  if (errorDescription) {
    const signInUrl = new URL("/auth/sign-in", url.origin);
    signInUrl.searchParams.set("error", errorDescription);
    signInUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(signInUrl);
  }

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const signInUrl = new URL("/auth/sign-in", url.origin);
      signInUrl.searchParams.set("error", "Unable to complete sign-in.");
      signInUrl.searchParams.set("next", nextPath);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.redirect(new URL(nextPath, url.origin));
}
