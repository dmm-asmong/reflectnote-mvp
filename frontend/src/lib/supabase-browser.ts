"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "./env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { values } = getPublicEnv();
  browserClient = createBrowserClient(
    values.NEXT_PUBLIC_SUPABASE_URL,
    values.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return browserClient;
}
