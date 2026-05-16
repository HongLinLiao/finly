import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { normalizeReturnTo } from "@/lib/auth/handoff";
import { CookieKey, createSessionJwt, getSessionCookieOptions } from "@/lib/auth/session";
import { consumeAuthTicket } from "@/lib/supabase/auth-ticket/consumeAuthTicket";
import { getUserByUid } from "@/lib/supabase/user/getUserByUid";

export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get("ticket");

  if (!ticket) {
    return new NextResponse("Missing auth ticket", { status: 400 });
  }

  const consumedTicket = await consumeAuthTicket(ticket, request.nextUrl.origin);

  if (!consumedTicket) {
    return new NextResponse("Invalid or expired auth ticket", { status: 400 });
  }

  const user = await getUserByUid(consumedTicket.user_uid);

  if (!user) {
    return new NextResponse("Cannot resolve ticket user", { status: 400 });
  }

  const jwt = await createSessionJwt(user);
  const cookieStore = await cookies();
  cookieStore.set(CookieKey.JWT, jwt, getSessionCookieOptions());

  return NextResponse.redirect(new URL(normalizeReturnTo(consumedTicket.return_to), request.url));
}
