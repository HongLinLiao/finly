import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getEffectiveGrossAmount, getEffectiveNetAmount } from "@/lib/transaction-amounts";

import type { FundTransaction } from "@/types";

export interface GetFundTransactionRecordsOptions {
  tradeDateFrom?: string;
  tradeDateTo?: string;
}

async function getFundTransactionRecords(
  userUid: string,
  options: GetFundTransactionRecordsOptions = {}
) {
  const supabase = getSupabaseAdminClient();

  let query = supabase.from("fund_transactions").select("*").eq("user_uid", userUid);

  if (options.tradeDateFrom) {
    query = query.gte("trade_date", options.tradeDateFrom);
  }

  if (options.tradeDateTo) {
    query = query.lt("trade_date", options.tradeDateTo);
  }

  const { data, error } = await query.order("trade_date", { ascending: false });

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

  return (data ?? []).map(item => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unit_price);
    const grossAmountInput = item.gross_amount == null ? null : Number(item.gross_amount);
    const netAmountInput = item.net_amount == null ? null : Number(item.net_amount);
    const fee = item.fee == null ? undefined : Number(item.fee);
    const tax = item.tax == null ? undefined : Number(item.tax);
    const grossAmount = getEffectiveGrossAmount({
      grossAmount: grossAmountInput,
      quantity,
      unitPrice,
    });
    const netAmount = getEffectiveNetAmount({
      side: item.side,
      grossAmount,
      netAmount: netAmountInput,
      fee,
      tax,
    });

    return {
      ...item,
      quantity,
      unit_price: unitPrice,
      gross_amount: grossAmount,
      gross_amount_input: grossAmountInput,
      fee,
      tax,
      net_amount: netAmount,
      net_amount_input: netAmountInput,
      cash_account_id: movementMap.get(item.id)?.cash_account_id,
      cash_settlement_amount: movementMap.get(item.id)?.amount,
      cash_settlement_amount_input:
        item.cash_settlement_amount == null ? null : Number(item.cash_settlement_amount),
      trade_date: new Date(item.trade_date).getTime() / 1000,
      nav_date: item.nav_date ? new Date(item.nav_date).getTime() / 1000 : undefined,
      created_at: new Date(item.created_at).getTime() / 1000,
      updated_at: new Date(item.updated_at).getTime() / 1000,
    };
  }) as FundTransaction[];
}

export default getFundTransactionRecords;
