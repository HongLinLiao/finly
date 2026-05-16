import { createRawAuthTicket, hashAuthTicket, normalizeReturnTo } from "@/lib/auth/handoff";

import { getSupabaseAdminClient } from "../server";

const TICKET_TTL_MS = 2 * 60 * 1000;

interface CreateAuthTicketPayload {
  userUid: string;
  targetOrigin: string;
  returnTo: string;
}

export async function createAuthTicket(payload: CreateAuthTicketPayload) {
  const rawTicket = createRawAuthTicket();
  const ticketHash = hashAuthTicket(rawTicket);
  const expiresAt = new Date(Date.now() + TICKET_TTL_MS).toISOString();
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("auth_tickets").insert({
    ticket_hash: ticketHash,
    user_uid: payload.userUid,
    target_origin: payload.targetOrigin,
    return_to: normalizeReturnTo(payload.returnTo),
    expires_at: expiresAt,
  });

  if (error) {
    console.error("Supabase create auth ticket error:", error);
    throw error;
  }

  return rawTicket;
}
