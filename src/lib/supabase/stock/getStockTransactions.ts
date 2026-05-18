import { getSupabaseAdminClient } from "@/lib/supabase/server";

import type { StockTransaction } from "@/types";

async function getStockTransactionRecords(userUid: string) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("stock_transactions")
    .select("*")
    .eq("user_uid", userUid)
    .order("trade_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch stock transactions: ${error.message}`);
  }

  return (data ?? []).map(item => ({
    ...item,
    trade_date: new Date(item.trade_date).getTime() / 1000,
    created_at: new Date(item.created_at).getTime() / 1000,
    updated_at: new Date(item.updated_at).getTime() / 1000,
  })) as StockTransaction[];
}

export default getStockTransactionRecords;
