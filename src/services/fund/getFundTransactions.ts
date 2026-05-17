import getFundTransactionRecords from "@/lib/supabase/fund/getFundTransactions";

async function getFundTransactions(userUid: string) {
  return getFundTransactionRecords(userUid);
}

export default getFundTransactions;
