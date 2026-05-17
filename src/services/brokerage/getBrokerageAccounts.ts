import getBrokerageAccountRecords from "@/lib/supabase/brokerage/getBrokerageAccounts";

export type { BrokerageAccountWithCashAccounts } from "@/lib/supabase/brokerage/getBrokerageAccounts";

async function getBrokerageAccounts(uid: string) {
  return getBrokerageAccountRecords(uid);
}

export default getBrokerageAccounts;
