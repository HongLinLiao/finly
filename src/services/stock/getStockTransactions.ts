import getStockTransactionRecords from "@/lib/supabase/stock/getStockTransactions";

async function getStockTransactions(userUid: string) {
  return getStockTransactionRecords(userUid);
}

export default getStockTransactions;
