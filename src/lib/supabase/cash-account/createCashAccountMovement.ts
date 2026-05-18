import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { AssetKind, CashMovementDirection, CashMovementMethod, CurrencyCode } from "@/types";

export interface CreateCashAccountMovementInput {
  userUid: string;
  brokerageAccountId: string;
  cashAccountId: string;
  occurredAt: string;
  settleAt?: string | null;
  direction: CashMovementDirection;
  method: CashMovementMethod;
  amount: number;
  currency: CurrencyCode;
  relatedAssetType: AssetKind;
  stockTransactionId?: string | null;
  fundTransactionId?: string | null;
  relatedAssetCode: string;
  note?: string | null;
}

async function createCashAccountMovementRecord(input: CreateCashAccountMovementInput) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("cash_account_movements")
    .insert({
      user_uid: input.userUid,
      brokerage_account_id: input.brokerageAccountId,
      cash_account_id: input.cashAccountId,
      occurred_at: input.occurredAt,
      settle_at: input.settleAt ?? null,
      direction: input.direction,
      method: input.method,
      amount: input.amount,
      currency: input.currency,
      related_asset_type: input.relatedAssetType,
      stock_transaction_id: input.stockTransactionId ?? null,
      fund_transaction_id: input.fundTransactionId ?? null,
      related_asset_code: input.relatedAssetCode,
      note: input.note ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create cash account movement: ${error.message}`);
  }

  return data;
}

export default createCashAccountMovementRecord;
