import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { CurrencyCode } from "@/types";

export interface CreateCashAccountRecordInput {
  userUid: string;
  brokerageAccountId: string;
  currency: CurrencyCode;
  accountName?: string | null;
}

async function createCashAccountRecord({
  userUid,
  brokerageAccountId,
  currency,
  accountName,
}: CreateCashAccountRecordInput) {
  const supabase = getSupabaseAdminClient();

  const { data: brokerageAccount, error: brokerageAccountError } = await supabase
    .from("brokerage_accounts")
    .select("id")
    .eq("id", brokerageAccountId)
    .eq("user_uid", userUid)
    .maybeSingle();

  if (brokerageAccountError) {
    throw new Error(`Failed to verify brokerage account: ${brokerageAccountError.message}`);
  }

  if (!brokerageAccount) {
    throw new Error("Brokerage account does not belong to current user.");
  }

  const { data, error } = await supabase
    .from("securities_cash_accounts")
    .insert({
      user_uid: userUid,
      brokerage_account_id: brokerageAccountId,
      currency,
      account_name: accountName ?? null,
    })
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
    .single();

  if (error) {
    throw new Error(`Failed to create cash account: ${error.message}`);
  }

  return data;
}

export default createCashAccountRecord;
