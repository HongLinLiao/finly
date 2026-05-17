import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { CurrencyCode } from "@/types";

export interface CreateBrokerageAccountRecordInput {
  userUid: string;
  accountName: string;
  brokerName: string;
  accountNo?: string | null;
  baseCurrency?: CurrencyCode | null;
}

async function createBrokerageAccountRecord({
  userUid,
  accountName,
  brokerName,
  accountNo,
  baseCurrency,
}: CreateBrokerageAccountRecordInput) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("brokerage_accounts")
    .insert({
      user_uid: userUid,
      account_name: accountName,
      broker_name: brokerName,
      account_no: accountNo ?? null,
      base_currency: baseCurrency ?? null,
    })
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
    .single();

  if (error) {
    throw new Error(`Failed to create brokerage account: ${error.message}`);
  }

  return data;
}

export default createBrokerageAccountRecord;
