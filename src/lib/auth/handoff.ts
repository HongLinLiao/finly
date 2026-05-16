import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";

import { jwtVerify, SignJWT } from "jose";

import { environment } from "@/lib/environment";

const STATE_TTL_SECONDS = 10 * 60;

const secret = new TextEncoder().encode(environment.jwtSecret);

type LineAuthStatePayload = {
  purpose: "line_oauth_state";
  mode: "direct" | "handoff";
  returnTo: string;
  nonce: string;
  targetOrigin?: string;
};

export type VerifiedLineAuthState = Pick<
  LineAuthStatePayload,
  "mode" | "returnTo" | "targetOrigin"
>;

export function normalizeReturnTo(value?: string | string[] | null) {
  const returnTo = Array.isArray(value) ? value[0] : value;

  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return "/";
  }

  return returnTo;
}

export function getOriginFromUrl(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isAllowedHandoffTargetOrigin(targetOrigin: string) {
  const callbackOrigin = getOriginFromUrl(environment.lineRedirectUri);

  if (!callbackOrigin || targetOrigin === callbackOrigin) {
    return false;
  }

  try {
    const target = new URL(targetOrigin);
    const callback = new URL(callbackOrigin);

    if (target.protocol !== "https:" || !target.hostname.endsWith(".vercel.app")) {
      return false;
    }

    const projectName = environment.authHandoffVercelProjectName || callback.hostname.split(".")[0];

    return Boolean(projectName) && target.hostname.startsWith(`${projectName}-`);
  } catch {
    return false;
  }
}

export async function createLineAuthState(requestOrigin: string, returnTo?: string | string[]) {
  const safeReturnTo = normalizeReturnTo(returnTo);
  const mode = isAllowedHandoffTargetOrigin(requestOrigin) ? "handoff" : "direct";
  const payload: LineAuthStatePayload = {
    purpose: "line_oauth_state",
    mode,
    returnTo: safeReturnTo,
    nonce: randomUUID(),
    ...(mode === "handoff" ? { targetOrigin: requestOrigin } : {}),
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${STATE_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyLineAuthState(state: string): Promise<VerifiedLineAuthState | null> {
  try {
    const { payload } = await jwtVerify(state, secret);

    if (payload.purpose !== "line_oauth_state") {
      return null;
    }

    const mode = payload.mode === "handoff" ? "handoff" : "direct";
    const returnTo = normalizeReturnTo(
      typeof payload.returnTo === "string" ? payload.returnTo : undefined
    );
    const targetOrigin =
      typeof payload.targetOrigin === "string" ? payload.targetOrigin : undefined;

    if (mode === "handoff" && (!targetOrigin || !isAllowedHandoffTargetOrigin(targetOrigin))) {
      return null;
    }

    return {
      mode,
      returnTo,
      ...(mode === "handoff" ? { targetOrigin } : {}),
    };
  } catch {
    return null;
  }
}

export function createRawAuthTicket() {
  return randomBytes(32).toString("base64url");
}

export function hashAuthTicket(ticket: string) {
  return createHash("sha256").update(ticket).digest("hex");
}
