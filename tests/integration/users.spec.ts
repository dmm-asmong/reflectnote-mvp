import { afterEach, describe, expect, it, vi } from "vitest";

import { ensureUserProfile } from "../../backend/src/services/users";

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("user profile sync", () => {
  it("upserts the authenticated user's profile with the scoped client", async () => {
    const upsert = vi.fn().mockReturnValue({
      select: () => ({
        single: async () => ({
          data: {
            id: "user-123",
            email: "student@example.com",
            grade: "10",
            created_at: "2026-03-09T00:00:00.000Z",
          },
          error: null,
        }),
      }),
    });

    const supabase = {
      auth: {
        getUser: async () => ({
          data: {
            user: {
              id: "user-123",
              email: "student@example.com",
              user_metadata: { grade: "10" },
            },
          },
          error: null,
        }),
      },
      from(table: string) {
        if (table !== "users") {
          throw new Error(`Unexpected table: ${table}`);
        }

        return {
          upsert,
        };
      },
    };

    const profile = await ensureUserProfile(supabase as never, "user-123");

    expect(upsert).toHaveBeenCalledWith(
      {
        id: "user-123",
        email: "student@example.com",
        grade: "10",
      },
      { onConflict: "id" },
    );
    expect(profile?.email).toBe("student@example.com");
  });

  it("throws when the authenticated user does not match the requested id", async () => {
    const supabase = {
      auth: {
        getUser: async () => ({
          data: {
            user: {
              id: "other-user",
              email: "student@example.com",
              user_metadata: {},
            },
          },
          error: null,
        }),
      },
    };

    await expect(ensureUserProfile(supabase as never, "user-123")).rejects.toThrow(
      "Unable to load the authenticated user.",
    );
  });
});
