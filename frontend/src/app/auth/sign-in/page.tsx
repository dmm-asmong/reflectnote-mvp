import { Suspense } from "react";

import { SignInForm } from "@/components/auth/sign-in-form";
import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { hasSupabaseEnv } from "@/lib/env";

export default function SignInPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseSetupNotice />;
  }

  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
