import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { CurrencyCode, DividendMode, FundTransactionType, TradeSide } from "@/types";

export interface UpdateFundTransactionRecordInput {
  id: string;
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
  grossAmount?: number | null;
  fee?: number | null;
  tax?: number | null;
  netAmount?: number | null;
  effectiveNetAmount: number;
  currency: CurrencyCode;
  cashSettlementAmount?: number | null;
  note?: string | null;
}

function getMovementMethod(transactionType?: FundTransactionType | null) {
  return transactionType === "redeem"
    ? "fund-redeem-settlement"
    : transactionType === "switch-in"
      ? "fund-switch-in-settlement"
      : transactionType === "switch-out"
        ? "fund-switch-out-settlement"
        : "fund-subscribe-settlement";
}

async function updateFundTransactionRecord(input: UpdateFundTransactionRecordInput) {
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
    (cashAccount.currency === input.currency ? input.effectiveNetAmount : null);

  if (!cashSettlementAmount) {
    throw new Error("Cash settlement amount is required for cross-currency transactions.");
  }

  const { data, error } = await supabase
    .from("fund_transactions")
    .update({
      account_id: input.accountId,
      trade_date: input.tradeDate,
      side: input.side,
      fund_code: input.fundCode,
      nav_date: input.navDate ?? null,
      transaction_type: input.transactionType ?? null,
      dividend_mode: input.dividendMode ?? null,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      gross_amount: input.grossAmount ?? null,
      fee: input.fee ?? null,
      tax: input.tax ?? null,
      net_amount: input.netAmount ?? null,
      cash_settlement_amount: input.cashSettlementAmount ?? null,
      currency: input.currency,
      note: input.note ?? null,
    })
    .eq("id", input.id)
    .eq("user_uid", input.userUid)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update fund transaction: ${error.message}`);
  }

  if (!data) {
    throw new Error("Fund transaction does not belong to current user.");
  }

  const { error: movementError } = await supabase
    .from("cash_account_movements")
    .update({
      brokerage_account_id: input.accountId,
      cash_account_id: input.cashAccountId,
      occurred_at: input.tradeDate,
      direction: input.side === "buy" ? "out" : "in",
      method: getMovementMethod(input.transactionType),
      amount: cashSettlementAmount,
      currency: cashAccount.currency,
      related_asset_type: "fund",
      related_asset_code: input.fundCode,
      note:
        cashAccount.currency === input.currency
          ? input.note
          : `交易淨額 ${input.currency} ${input.effectiveNetAmount}`,
    })
    .eq("fund_transaction_id", input.id)
    .eq("user_uid", input.userUid);

  if (movementError) {
    throw new Error(`Failed to update fund cash movement: ${movementError.message}`);
  }

  return data;
}

export default updateFundTransactionRecord;
