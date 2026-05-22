import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { FundTransaction } from "@/types";

async function getFundTransactionRecords(userUid: string) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("fund_transactions")
    .select("*")
    .eq("user_uid", userUid)
    .order("trade_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch fund transactions: ${error.message}`);
  }

  const transactionIds = (data ?? []).map(item => item.id);
  const movementMap = new Map<
    string,
    {
      cash_account_id: string;
      amount: number;
    }
  >();

  if (transactionIds.length > 0) {
    const { data: movements, error: movementError } = await supabase
      .from("cash_account_movements")
      .select("fund_transaction_id, cash_account_id, amount")
      .eq("user_uid", userUid)
      .in("fund_transaction_id", transactionIds);

    if (movementError) {
      throw new Error(`Failed to fetch fund cash movements: ${movementError.message}`);
    }

    movements?.forEach(movement => {
      if (!movement.fund_transaction_id) return;

      movementMap.set(movement.fund_transaction_id, {
        cash_account_id: movement.cash_account_id,
        amount: Number(movement.amount),
      });
    });
  }

  return (data ?? []).map(item => ({
    ...item,
    cash_account_id: movementMap.get(item.id)?.cash_account_id,
    cash_settlement_amount: movementMap.get(item.id)?.amount,
    trade_date: new Date(item.trade_date).getTime() / 1000,
    nav_date: item.nav_date ? new Date(item.nav_date).getTime() / 1000 : undefined,
    created_at: new Date(item.created_at).getTime() / 1000,
    updated_at: new Date(item.updated_at).getTime() / 1000,
  })) as FundTransaction[];
}

export default getFundTransactionRecords;
