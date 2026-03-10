"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

function sanitizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/";
  }

  return nextPath;
}

export function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(searchParams.get("error") ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const nextPath = sanitizeNextPath(searchParams.get("next"));
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.set("next", nextPath);

      // 매직 링크 대신 이메일+비밀번호로 인증을 시도합니다.
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // 만약 계정이 없다면 회원가입을 시도합니다. (Confirm email이 꺼져있어야 바로 로그인됨)
      if (signInError && signInError.message.includes("Invalid login credentials")) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        if (!signUpData.session) {
          throw new Error("회원가입은 성공했으나 자동 로그인되지 않았습니다. (이메일 인증이 필요할 수 있습니다.)");
        }
      } else if (signInError) {
        throw new Error(signInError.message);
      }

      window.location.href = nextPath;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "로그인 또는 가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <PageHeader
        eyebrow="로그인 (테스트 모드)"
        title="이메일과 비밀번호로 시작해요."
        description="이메일 발송 제한을 피하기 위해 임시로 비밀번호 방식을 사용합니다. 없는 계정으로 로그인하면 자동으로 가입됩니다."
      />

      <SectionCard title="이메일 로그인" eyebrow="테스트 접속">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">이메일</span>
            <input
              className="rounded-2xl border border-black/10 bg-surface px-4 py-3 text-ink"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@example.com"
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">비밀번호 (임시)</span>
            <input
              className="rounded-2xl border border-black/10 bg-surface px-4 py-3 text-ink"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="123456"
              required
              minLength={6}
            />
          </label>

          {statusMessage ? <p className="text-sm text-status-success">{statusMessage}</p> : null}
          {errorMessage ? <p className="text-sm text-status-error">{errorMessage}</p> : null}

          <Button type="submit" disabled={isSubmitting || email.length === 0 || password.length < 6}>
            {isSubmitting ? "접속 중..." : "로그인 / 자동 가입"}
          </Button>
        </form>
      </SectionCard>
    </div>
  );
}
