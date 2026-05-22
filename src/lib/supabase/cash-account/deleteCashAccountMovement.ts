import { getSupabaseAdminClient } from "@/lib/supabase/server";

export interface DeleteCashAccountMovementInput {
  id: string;
  userUid: string;
}

async function deleteCashAccountMovementRecord({ id, userUid }: DeleteCashAccountMovementInput) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("cash_account_movements")
    .delete()
    .eq("id", id)
    .eq("user_uid", userUid)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete cash account movement: ${error.message}`);
  }

  if (!data) {
    throw new Error("Cash account movement does not belong to current user.");
  }

  return data;
}

export default deleteCashAccountMovementRecord;
