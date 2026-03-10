import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getPublicEnv, hasSupabaseEnv } from "./env";

type SupabaseCookieSetOptions = Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2];
type SupabaseCookieWrite = {
  name: string;
  value: string;
  options?: SupabaseCookieSetOptions;
};

export async function getSupabaseServerClient() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase public environment variables are missing.");
  }

  const cookieStore = await cookies();
  const { values } = getPublicEnv();

  return createServerClient(values.NEXT_PUBLIC_SUPABASE_URL, values.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookieValues: SupabaseCookieWrite[]) {
        cookieValues.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server Components can read cookies but cannot always write them.
          }
        });
      },
    },
  });
}
