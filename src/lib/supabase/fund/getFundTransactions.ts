import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { FundTransaction } from "@/types";

async function getFundTransactionRecords(userUid: string) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("fund_transactions")
    .select("*")
    .eq("user_uid", userUid)
    .order("trade_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch fund transactions: ${error.message}`);
  }

  return (data ?? []).map(item => ({
    ...item,
    trade_date: new Date(item.trade_date).getTime() / 1000,
    nav_date: item.nav_date ? new Date(item.nav_date).getTime() / 1000 : undefined,
    created_at: new Date(item.created_at).getTime() / 1000,
    updated_at: new Date(item.updated_at).getTime() / 1000,
  })) as FundTransaction[];
}

export default getFundTransactionRecords;
