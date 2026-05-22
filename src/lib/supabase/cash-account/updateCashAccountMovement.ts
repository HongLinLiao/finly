import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { AssetKind, CashMovementDirection, CashMovementMethod, CurrencyCode } from "@/types";

export interface UpdateCashAccountMovementInput {
  id: string;
  userUid: string;
  brokerageAccountId: string;
  cashAccountId: string;
  occurredAt: string;
  direction: CashMovementDirection;
  method: CashMovementMethod;
  amount: number;
  currency: CurrencyCode;
  balanceAfter?: number | null;
  relatedAssetType?: AssetKind | null;
  relatedAssetCode?: string | null;
  note?: string | null;
}

async function updateCashAccountMovementRecord(input: UpdateCashAccountMovementInput) {
  const supabase = getSupabaseAdminClient();

  const { data: cashAccount, error: cashAccountError } = await supabase
    .from("securities_cash_accounts")
    .select("id")
    .eq("id", input.cashAccountId)
    .eq("brokerage_account_id", input.brokerageAccountId)
    .eq("user_uid", input.userUid)
    .maybeSingle();

  if (cashAccountError) {
    throw new Error(`Failed to verify cash account: ${cashAccountError.message}`);
  }

  if (!cashAccount) {
    throw new Error("Cash account does not belong to current brokerage account.");
  }

  const { data, error } = await supabase
    .from("cash_account_movements")
    .update({
      brokerage_account_id: input.brokerageAccountId,
      cash_account_id: input.cashAccountId,
      occurred_at: input.occurredAt,
      direction: input.direction,
      method: input.method,
      amount: input.amount,
      currency: input.currency,
      balance_after: input.balanceAfter ?? null,
      related_asset_type: input.relatedAssetType ?? null,
      related_asset_code: input.relatedAssetCode ?? null,
      note: input.note ?? null,
    })
    .eq("id", input.id)
    .eq("user_uid", input.userUid)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update cash account movement: ${error.message}`);
  }

  if (!data) {
    throw new Error("Cash account movement does not belong to current user.");
  }

  return data;
}

export default updateCashAccountMovementRecord;
