import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("auth callback route", () => {
  it("redirects back to sign-in with an error when Supabase returns an auth error", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: new Error("exchange failed") });
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    vi.mocked(getSupabaseServerClient).mockResolvedValue({ auth: { exchangeCodeForSession } } as never);

    const route = await import("../../frontend/src/app/auth/callback/route");
    const response = await route.GET(new Request("http://localhost/auth/callback?code=test-code&next=/progress"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/auth/sign-in?error=Unable+to+complete+sign-in.&next=%2Fprogress",
    );
  });

  it("exchanges the auth code and redirects to the requested internal path", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    vi.mocked(getSupabaseServerClient).mockResolvedValue({ auth: { exchangeCodeForSession } } as never);

    const route = await import("../../frontend/src/app/auth/callback/route");
    const response = await route.GET(new Request("http://localhost/auth/callback?code=test-code&next=/progress"));

    expect(exchangeCodeForSession).toHaveBeenCalledWith("test-code");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/progress");
  });

  it("blocks open redirects by falling back to the dashboard", async () => {
    const route = await import("../../frontend/src/app/auth/callback/route");
    const response = await route.GET(new Request("http://localhost/auth/callback?next=https://evil.example"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });
});
