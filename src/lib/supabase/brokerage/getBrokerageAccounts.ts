import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { BrokerageAccount, SecuritiesCashAccount } from "@/types";

export type BrokerageAccountWithCashAccounts = BrokerageAccount & {
  securities_cash_accounts: Pick<
    SecuritiesCashAccount,
    "id" | "currency" | "account_name" | "status"
  >[];
};

async function getBrokerageAccountRecords(uid: string) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("brokerage_accounts")
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
        updated_at,
        securities_cash_accounts (
          id,
          currency,
          account_name,
          status
        )
      `
    )
    .eq("user_uid", uid)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch brokerage accounts: ${error.message}`);
  }

  return (data ?? []) as BrokerageAccountWithCashAccounts[];
}

export default getBrokerageAccountRecords;
