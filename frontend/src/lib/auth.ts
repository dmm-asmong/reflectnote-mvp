import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "./supabase-server";

export async function getOptionalUserId() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function requireUserId() {
  const userId = await getOptionalUserId();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  return userId;
}
