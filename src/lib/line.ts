import { LineIdTokenPayload } from "@/types/line";

export function parseIdTokenPayload(idToken?: string): LineIdTokenPayload | null {
  if (!idToken) return null;

  const segments = idToken.split(".");
  if (segments.length < 2) return null;

  try {
    const payload = Buffer.from(segments[1], "base64url").toString("utf8");
    return JSON.parse(payload) as LineIdTokenPayload;
  } catch {
    return null;
  }
}
