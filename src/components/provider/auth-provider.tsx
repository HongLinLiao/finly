import { cookies } from "next/headers";
import * as React from "react";

import { CookieKey } from "@/lib/cookie";
import { decodeToken } from "@/lib/jwt";
import { getUserByUid } from "@/lib/supabase/user/getUserByUid";
import { User } from "@/types/user";

import { AuthInitializer } from "../util/auth-initializer";

export async function AuthProvider({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get(CookieKey.JWT)?.value;

  let user: User | null = null;

  if (jwt) {
    try {
      const payload = await decodeToken(jwt);
      if (payload?.uid) {
        user = await getUserByUid(payload.uid);
      }
    } catch (error) {
      console.error("Failed to authenticate user on server:", error);
    }
  }

  return (
    <>
      <AuthInitializer user={user} />
      {children}
    </>
  );
}
