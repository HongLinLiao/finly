import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { CookieKey } from "@/lib/cookie";
import { decodeToken } from "@/lib/jwt";
import { getUserByUid } from "@/lib/supabase/user/getUserByUid";

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const jwt = cookieStore.get(CookieKey.JWT)?.value;

  if (!jwt) return null;

  try {
    const payload = await decodeToken(jwt);

    if (!payload?.uid) return null;

    return getUserByUid(payload.uid);
  } catch (error) {
    console.error("Failed to authenticate user on server:", error);
    return null;
  }
});
