import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { AccountStatus } from "@/types";

export interface UpdateCashAccountRecordInput {
  id: string;
  userUid: string;
  accountName?: string | null;
  status: AccountStatus;
}

async function updateCashAccountRecord({
  id,
  userUid,
  accountName,
  status,
}: UpdateCashAccountRecordInput) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("securities_cash_accounts")
    .update({
      account_name: accountName ?? null,
      status,
    })
    .eq("id", id)
    .eq("user_uid", userUid)
    .select(
      `
        id,
        user_uid,
        brokerage_account_id,
        currency,
        account_name,
        status,
        created_at,
        updated_at
      `
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update cash account: ${error.message}`);
  }

  if (!data) {
    throw new Error("Cash account does not belong to current user.");
  }

  return data;
}

export default updateCashAccountRecord;
