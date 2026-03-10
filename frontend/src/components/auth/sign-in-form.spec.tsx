import React from "react";

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const signInWithOtp = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

vi.mock("@/lib/supabase-browser", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signInWithOtp,
    },
  }),
}));

import { SignInForm } from "./sign-in-form";

afterEach(() => {
  cleanup();
  signInWithOtp.mockReset();
  searchParams.delete("next");
  searchParams.delete("error");
  vi.restoreAllMocks();
});

describe("sign in form", () => {
  it("requests a magic link using the auth callback url", async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    searchParams.set("next", "/progress");

    render(<SignInForm />);

    await userEvent.type(screen.getByPlaceholderText("student@example.com"), "student@example.com");
    await userEvent.click(screen.getByRole("button", { name: "로그인 링크 보내기" }));

    await waitFor(() => {
      expect(signInWithOtp).toHaveBeenCalledWith({
        email: "student@example.com",
        options: {
          emailRedirectTo: "http://localhost:3000/auth/callback?next=%2Fprogress",
        },
      });
    });
    await screen.findByText("이메일로 로그인 링크를 보냈어요. 메일함을 확인해 주세요.");
  });

  it("renders callback errors passed in the query string", () => {
    searchParams.set("error", "로그인을 완료하지 못했습니다.");

    render(<SignInForm />);

    expect(screen.getByText("로그인을 완료하지 못했습니다.")).toBeTruthy();
  });
});
