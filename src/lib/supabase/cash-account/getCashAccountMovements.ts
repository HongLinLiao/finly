import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { CashAccountMovement } from "@/types";

async function getCashAccountMovementRecords(userUid: string) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("cash_account_movements")
    .select("*")
    .eq("user_uid", userUid)
    .order("occurred_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch cash account movements: ${error.message}`);
  }

  return (data ?? []).map(item => ({
    ...item,
    occurred_at: new Date(item.occurred_at).getTime() / 1000,
    created_at: new Date(item.created_at).getTime() / 1000,
    updated_at: new Date(item.updated_at).getTime() / 1000,
  })) as CashAccountMovement[];
}

export default getCashAccountMovementRecords;
