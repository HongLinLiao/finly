import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { CashAccountMovement } from "@/types";

export interface GetCashAccountMovementRecordsOptions {
  occurredAtFrom?: string;
  occurredAtTo?: string;
}

async function getCashAccountMovementRecords(
  userUid: string,
  options: GetCashAccountMovementRecordsOptions = {}
) {
  const supabase = getSupabaseAdminClient();

  let query = supabase.from("cash_account_movements").select("*").eq("user_uid", userUid);

  if (options.occurredAtFrom) {
    query = query.gte("occurred_at", options.occurredAtFrom);
  }

  if (options.occurredAtTo) {
    query = query.lt("occurred_at", options.occurredAtTo);
  }

  const { data, error } = await query.order("occurred_at", { ascending: false });

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
