import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { AccountStatus } from "@/types";

export interface UpdateBrokerageAccountRecordInput {
  id: string;
  userUid: string;
  accountName: string;
  brokerName: string;
  accountNo?: string | null;
  status: AccountStatus;
}

async function updateBrokerageAccountRecord({
  id,
  userUid,
  accountName,
  brokerName,
  accountNo,
  status,
}: UpdateBrokerageAccountRecordInput) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("brokerage_accounts")
    .update({
      account_name: accountName,
      broker_name: brokerName,
      account_no: accountNo ?? null,
      status,
    })
    .eq("id", id)
    .eq("user_uid", userUid)
    .select(
      `
        id,
        user_uid,
        broker_name,
        account_no,
        account_name,
        status,
        base_currency,
        created_at,
        updated_at
      `
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update brokerage account: ${error.message}`);
  }

  if (!data) {
    throw new Error("Brokerage account does not belong to current user.");
  }

  return data;
}

export default updateBrokerageAccountRecord;
