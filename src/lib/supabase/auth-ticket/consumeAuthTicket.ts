import { hashAuthTicket } from "@/lib/auth/handoff";

import { getSupabaseAdminClient } from "../server";

interface ConsumedAuthTicket {
  user_uid: string;
  return_to: string;
}

export async function consumeAuthTicket(ticket: string, requestOrigin: string) {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("auth_tickets")
    .update({ consumed_at: now })
    .eq("ticket_hash", hashAuthTicket(ticket))
    .eq("target_origin", requestOrigin)
    .is("consumed_at", null)
    .gt("expires_at", now)
    .select("user_uid, return_to")
    .single<ConsumedAuthTicket>();

  if (error) {
    console.error("Supabase consume auth ticket error:", error);
    return null;
  }

  return data;
}
