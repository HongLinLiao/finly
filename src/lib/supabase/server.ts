import "server-only";

import { createClient } from "@supabase/supabase-js";

import { environment } from "@/lib/environment";

export function getSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = environment;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase env is not configured correctly.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
