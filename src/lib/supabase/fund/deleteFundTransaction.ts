import { getSupabaseAdminClient } from "@/lib/supabase/server";

export interface DeleteFundTransactionRecordInput {
  id: string;
  userUid: string;
}

async function deleteFundTransactionRecord({ id, userUid }: DeleteFundTransactionRecordInput) {
  const supabase = getSupabaseAdminClient();

  const { error: movementError } = await supabase
    .from("cash_account_movements")
    .delete()
    .eq("fund_transaction_id", id)
    .eq("user_uid", userUid);

  if (movementError) {
    throw new Error(`Failed to delete fund cash movement: ${movementError.message}`);
  }

  const { data, error } = await supabase
    .from("fund_transactions")
    .delete()
    .eq("id", id)
    .eq("user_uid", userUid)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete fund transaction: ${error.message}`);
  }

  if (!data) {
    throw new Error("Fund transaction does not belong to current user.");
  }

  return data;
}

export default deleteFundTransactionRecord;
