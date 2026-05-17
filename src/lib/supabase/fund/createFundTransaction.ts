import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { CurrencyCode, DividendMode, FundTransactionType, TradeSide } from "@/types";

export interface CreateFundTransactionRecordInput {
  userUid: string;
  accountId: string;
  tradeDate: string;
  settleDate?: string | null;
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

  const { data, error } = await supabase
    .from("fund_transactions")
    .insert({
      user_uid: input.userUid,
      account_id: input.accountId,
      trade_date: input.tradeDate,
      settle_date: input.settleDate ?? null,
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

  return data;
}

export default createFundTransactionRecord;
