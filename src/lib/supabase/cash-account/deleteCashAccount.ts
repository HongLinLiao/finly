import { getSupabaseAdminClient } from "@/lib/supabase/server";

export interface DeleteCashAccountRecordInput {
  id: string;
  userUid: string;
}

async function deleteCashAccountRecord({ id, userUid }: DeleteCashAccountRecordInput) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("securities_cash_accounts")
    .delete()
    .eq("id", id)
    .eq("user_uid", userUid)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete cash account: ${error.message}`);
  }

  if (!data) {
    throw new Error("Cash account does not belong to current user.");
  }

  return data;
}

export default deleteCashAccountRecord;
