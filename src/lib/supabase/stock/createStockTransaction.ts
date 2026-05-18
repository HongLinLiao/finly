import createCashAccountMovementRecord from "@/lib/supabase/cash-account/createCashAccountMovement";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { CurrencyCode, TradeSide } from "@/types";

export interface CreateStockTransactionRecordInput {
  userUid: string;
  accountId: string;
  cashAccountId: string;
  tradeDate: string;
  side: TradeSide;
  symbol: string;
  market?: string | null;
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  fee?: number | null;
  tax?: number | null;
  netAmount: number;
  currency: CurrencyCode;
  cashSettlementAmount?: number | null;
  note?: string | null;
}

async function createStockTransactionRecord(input: CreateStockTransactionRecordInput) {
  const supabase = getSupabaseAdminClient();

  const { data: brokerageAccount, error: brokerageAccountError } = await supabase
    .from("brokerage_accounts")
    .select("id")
    .eq("id", input.accountId)
    .eq("user_uid", input.userUid)
    .maybeSingle();

  if (brokerageAccountError) {
    throw new Error(`Failed to verify brokerage account: ${brokerageAccountError.message}`);
  }

  if (!brokerageAccount) {
    throw new Error("Brokerage account does not belong to current user.");
  }

  const { data: cashAccount, error: cashAccountError } = await supabase
    .from("securities_cash_accounts")
    .select("id, currency")
    .eq("id", input.cashAccountId)
    .eq("brokerage_account_id", input.accountId)
    .eq("user_uid", input.userUid)
    .maybeSingle();

  if (cashAccountError) {
    throw new Error(`Failed to verify cash account: ${cashAccountError.message}`);
  }

  if (!cashAccount) {
    throw new Error("Cash account does not belong to current brokerage account.");
  }

  const cashSettlementAmount =
    input.cashSettlementAmount ??
    (cashAccount.currency === input.currency ? input.netAmount : null);

  if (!cashSettlementAmount) {
    throw new Error("Cash settlement amount is required for cross-currency transactions.");
  }

  const { data, error } = await supabase
    .from("stock_transactions")
    .insert({
      user_uid: input.userUid,
      account_id: input.accountId,
      trade_date: input.tradeDate,
      side: input.side,
      symbol: input.symbol,
      market: input.market ?? null,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      gross_amount: input.grossAmount,
      fee: input.fee ?? null,
      tax: input.tax ?? null,
      net_amount: input.netAmount,
      currency: input.currency,
      note: input.note ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create stock transaction: ${error.message}`);
  }

  await createCashAccountMovementRecord({
    userUid: input.userUid,
    brokerageAccountId: input.accountId,
    cashAccountId: input.cashAccountId,
    occurredAt: input.tradeDate,
    direction: input.side === "buy" ? "out" : "in",
    method: input.side === "buy" ? "stock-buy-settlement" : "stock-sell-settlement",
    amount: cashSettlementAmount,
    currency: cashAccount.currency,
    relatedAssetType: "stock",
    stockTransactionId: data.id,
    relatedAssetCode: input.symbol,
    note:
      cashAccount.currency === input.currency
        ? input.note
        : `交易淨額 ${input.currency} ${input.netAmount}`,
  });

  return data;
}

export default createStockTransactionRecord;
