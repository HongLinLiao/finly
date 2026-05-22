import { getSupabaseAdminClient } from "@/lib/supabase/server";

export interface DeleteStockTransactionRecordInput {
  id: string;
  userUid: string;
}

async function deleteStockTransactionRecord({ id, userUid }: DeleteStockTransactionRecordInput) {
  const supabase = getSupabaseAdminClient();

  const { error: movementError } = await supabase
    .from("cash_account_movements")
    .delete()
    .eq("stock_transaction_id", id)
    .eq("user_uid", userUid);

  if (movementError) {
    throw new Error(`Failed to delete stock cash movement: ${movementError.message}`);
  }

  const { data, error } = await supabase
    .from("stock_transactions")
    .delete()
    .eq("id", id)
    .eq("user_uid", userUid)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete stock transaction: ${error.message}`);
  }

  if (!data) {
    throw new Error("Stock transaction does not belong to current user.");
  }

  return data;
}

export default deleteStockTransactionRecord;
