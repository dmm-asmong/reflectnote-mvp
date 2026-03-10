import type { UserProfile } from "../types/review";
import type { AppSupabaseClient } from "../types/supabase";

export async function ensureUserProfile(supabase: AppSupabaseClient, userId: string): Promise<UserProfile | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || user.id !== userId) {
    throw new Error("Unable to load the authenticated user.");
  }

  const profileRow = {
    id: userId,
    email: user.email ?? "",
    grade: (user.user_metadata?.grade as string | undefined) ?? null,
  };

  const { data, error } = await supabase
    .from("users")
    .upsert(profileRow, { onConflict: "id" })
    .select("id, email, grade, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    email: data.email,
    grade: data.grade,
    createdAt: data.created_at,
  };
}
