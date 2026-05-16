import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { verifyLineAuthState } from "@/lib/auth/handoff";
import { CookieKey, createSessionJwt, getSessionCookieOptions } from "@/lib/auth/session";
import { parseIdTokenPayload } from "@/lib/line";
import { createAuthTicket } from "@/lib/supabase/auth-ticket/createAuthTicket";
import upsertUser from "@/lib/supabase/user/upsertUser";
import getProfile from "@/services/line/getProfile.server";
import getToken from "@/services/line/getToken.server";
import { User } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return new NextResponse("Invalid callback URL", { status: 400 });
  }

  const authState = await verifyLineAuthState(state);

  if (!authState) {
    return new NextResponse("Invalid auth state", { status: 400 });
  }

  const tokenResponse = await getToken(code);

  if (!tokenResponse.ok || tokenResponse.error || !tokenResponse.data) {
    const { error, status, statusText } = tokenResponse;
    console.error("Failed to exchange token:", JSON.stringify({ status, statusText, error }));
    return new NextResponse("Failed to exchange token", { status: 500 });
  }

  const { access_token, id_token } = tokenResponse.data;
  const profileResponse = await getProfile(access_token);

  if (!profileResponse.ok || profileResponse.error || !profileResponse.data) {
    const { error, status, statusText } = profileResponse;
    console.error("Failed to fetch LINE profile:", JSON.stringify({ status, statusText, error }));
    return new NextResponse("Failed to fetch LINE profile", { status: 500 });
  }

  const { userId, displayName, pictureUrl } = profileResponse.data;
  const idTokenPayload = parseIdTokenPayload(id_token);

  if (!userId) {
    return new NextResponse("Cannot resolve provider user id from LINE profile", { status: 400 });
  }

  let user: User;

  try {
    const data = await upsertUser({
      username: displayName,
      email: idTokenPayload?.email,
      avatar_url: pictureUrl,
      provider: "LINE",
      provider_user_id: userId,
    });
    user = data;
  } catch (error) {
    console.error("Failed to sync user to database:", error);
    return new NextResponse("Failed to sync user", { status: 500 });
  }

  if (authState.mode === "handoff" && authState.targetOrigin) {
    try {
      const ticket = await createAuthTicket({
        userUid: user.uid,
        targetOrigin: authState.targetOrigin,
        returnTo: authState.returnTo,
      });
      const consumeUrl = new URL("/api/auth/consume", authState.targetOrigin);
      consumeUrl.searchParams.set("ticket", ticket);

      return NextResponse.redirect(consumeUrl);
    } catch (error) {
      console.error("Failed to create auth handoff ticket:", error);
      return new NextResponse("Failed to create auth handoff ticket", { status: 500 });
    }
  }

  const jwt = await createSessionJwt(user);
  const cookieStore = await cookies();
  cookieStore.set(CookieKey.JWT, jwt, getSessionCookieOptions());

  return NextResponse.redirect(new URL(authState.returnTo, request.url));
}
