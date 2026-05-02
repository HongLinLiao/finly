import { User } from "@/types";

import { getSupabaseAdminClient } from "../server";

type UpserUserPayload = Omit<User, "uid" | "created_at">;

export default async function upsertUser(payload: UpserUserPayload) {
  const { username, email, avatar_url, provider, provider_user_id } = payload;
  const supabase = getSupabaseAdminClient();
  const { data, error: upsertError } = await supabase
    .from("users")
    .upsert(
      {
        username,
        email,
        avatar_url,
        provider,
        provider_user_id,
      },
      {
        onConflict: "provider,provider_user_id",
      }
    )
    .select("*")
    .single();

  if (upsertError) {
    console.error("Supabase upsert user error:", upsertError);
    throw upsertError;
  }

  return data;
}
