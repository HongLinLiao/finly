import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createLineAuthState, normalizeReturnTo } from "@/lib/auth/handoff";
import { environment } from "@/lib/environment";

interface LoginPageProps {
  searchParams?: Promise<{
    returnTo?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  const requestOrigin = host
    ? `${protocol}://${host}`
    : new URL(environment.lineRedirectUri).origin;
  const params = await searchParams;
  const returnTo = normalizeReturnTo(params?.returnTo);
  const state = await createLineAuthState(requestOrigin, returnTo);

  return redirect(
    `${environment.lineAccessApi}/authorize?response_type=code&client_id=${environment.lineLoginChannelId}&redirect_uri=${encodeURIComponent(environment.lineRedirectUri)}&scope=profile%20openid%20email&state=${encodeURIComponent(state)}`
  );
}
