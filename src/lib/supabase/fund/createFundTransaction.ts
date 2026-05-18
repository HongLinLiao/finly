import createCashAccountMovementRecord from "@/lib/supabase/cash-account/createCashAccountMovement";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { CurrencyCode, DividendMode, FundTransactionType, TradeSide } from "@/types";

export interface CreateFundTransactionRecordInput {
  userUid: string;
  accountId: string;
  cashAccountId: string;
  tradeDate: string;
  side: TradeSide;
  fundCode: string;
  navDate?: string | null;
  transactionType?: FundTransactionType | null;
  dividendMode?: DividendMode | null;
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

async function createFundTransactionRecord(input: CreateFundTransactionRecordInput) {
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
    .from("fund_transactions")
    .insert({
      user_uid: input.userUid,
      account_id: input.accountId,
      trade_date: input.tradeDate,
      side: input.side,
      fund_code: input.fundCode,
      nav_date: input.navDate ?? null,
      transaction_type: input.transactionType ?? null,
      dividend_mode: input.dividendMode ?? null,
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
    throw new Error(`Failed to create fund transaction: ${error.message}`);
  }

  const method =
    input.transactionType === "redeem"
      ? "fund-redeem-settlement"
      : input.transactionType === "switch-in"
        ? "fund-switch-in-settlement"
        : input.transactionType === "switch-out"
          ? "fund-switch-out-settlement"
          : "fund-subscribe-settlement";

  await createCashAccountMovementRecord({
    userUid: input.userUid,
    brokerageAccountId: input.accountId,
    cashAccountId: input.cashAccountId,
    occurredAt: input.tradeDate,
    direction: input.side === "buy" ? "out" : "in",
    method,
    amount: cashSettlementAmount,
    currency: cashAccount.currency,
    relatedAssetType: "fund",
    fundTransactionId: data.id,
    relatedAssetCode: input.fundCode,
    note:
      cashAccount.currency === input.currency
        ? input.note
        : `交易淨額 ${input.currency} ${input.netAmount}`,
  });

  return data;
}

export default createFundTransactionRecord;
