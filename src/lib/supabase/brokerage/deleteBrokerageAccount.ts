import { getSupabaseAdminClient } from "@/lib/supabase/server";

export interface DeleteBrokerageAccountRecordInput {
  id: string;
  userUid: string;
}

async function deleteBrokerageAccountRecord({ id, userUid }: DeleteBrokerageAccountRecordInput) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("brokerage_accounts")
    .delete()
    .eq("id", id)
    .eq("user_uid", userUid)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete brokerage account: ${error.message}`);
  }

  if (!data) {
    throw new Error("Brokerage account does not belong to current user.");
  }

  return data;
}

export default deleteBrokerageAccountRecord;
