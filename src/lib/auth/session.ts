import "server-only";

import { CookieKey } from "@/lib/cookie";
import { environment } from "@/lib/environment";
import { encodeToken } from "@/lib/jwt";
import { User } from "@/types";

export async function createSessionJwt(user: User) {
  return encodeToken({
    sub: user.uid,
    uid: user.uid,
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url,
    provider: user.provider,
  });
}

export function getSessionCookieOptions() {
  return {
    secure: environment.env === "production",
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  };
}

export { CookieKey };
