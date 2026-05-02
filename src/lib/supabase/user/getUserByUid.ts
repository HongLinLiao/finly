import { User } from "@/types";

import { getSupabaseAdminClient } from "../server";

export async function getUserByUid(uid: string) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.from("users").select("*").eq("uid", uid).single<User>();

  if (error) {
    console.error(`Supabase get user by uid (${uid}) error:`, error);
    return null;
  }

  return data;
}
