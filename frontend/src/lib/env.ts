const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export type PublicEnvKey = (typeof requiredKeys)[number];

export function getPublicEnv() {
  const missing = requiredKeys.filter((key) => !process.env[key]);

  return {
    values: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    },
    missing,
  };
}

export function getServerEnv() {
  return {
    openAiApiKey: process.env.OPENAI_API_KEY ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    defaultTimezone: process.env.REFLECTNOTE_DEFAULT_TIMEZONE ?? "Asia/Seoul",
  };
}

export function hasSupabaseEnv() {
  return getPublicEnv().missing.length === 0;
}
