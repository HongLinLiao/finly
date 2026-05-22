import getStockTransactionRecords from "@/lib/supabase/stock/getStockTransactions";

interface GetStockTransactionsOptions {
  tradeDateFrom?: string;
  tradeDateTo?: string;
}

async function getStockTransactions(userUid: string, options: GetStockTransactionsOptions = {}) {
  return getStockTransactionRecords(userUid, options);
}

export default getStockTransactions;
