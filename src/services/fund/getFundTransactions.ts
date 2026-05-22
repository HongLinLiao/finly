import getFundTransactionRecords from "@/lib/supabase/fund/getFundTransactions";

interface GetFundTransactionsOptions {
  tradeDateFrom?: string;
  tradeDateTo?: string;
}

async function getFundTransactions(userUid: string, options: GetFundTransactionsOptions = {}) {
  return getFundTransactionRecords(userUid, options);
}

export default getFundTransactions;
