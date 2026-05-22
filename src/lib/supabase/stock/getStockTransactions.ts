import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { StockTransaction } from "@/types";

export interface GetStockTransactionRecordsOptions {
  tradeDateFrom?: string;
  tradeDateTo?: string;
}

async function getStockTransactionRecords(
  userUid: string,
  options: GetStockTransactionRecordsOptions = {}
) {
  const supabase = getSupabaseAdminClient();

  let query = supabase.from("stock_transactions").select("*").eq("user_uid", userUid);

  if (options.tradeDateFrom) {
    query = query.gte("trade_date", options.tradeDateFrom);
  }

  if (options.tradeDateTo) {
    query = query.lt("trade_date", options.tradeDateTo);
  }

  const { data, error } = await query.order("trade_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch stock transactions: ${error.message}`);
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
      .select("stock_transaction_id, cash_account_id, amount")
      .eq("user_uid", userUid)
      .in("stock_transaction_id", transactionIds);

    if (movementError) {
      throw new Error(`Failed to fetch stock cash movements: ${movementError.message}`);
    }

    movements?.forEach(movement => {
      if (!movement.stock_transaction_id) return;

      movementMap.set(movement.stock_transaction_id, {
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
    created_at: new Date(item.created_at).getTime() / 1000,
    updated_at: new Date(item.updated_at).getTime() / 1000,
  })) as StockTransaction[];
}

export default getStockTransactionRecords;
