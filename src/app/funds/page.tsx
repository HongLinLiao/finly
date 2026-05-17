import { redirect } from "next/navigation";

import { FundsClientPage } from "@/components/fund/funds-client-page";
import Page from "@/components/util/Page";
import { getCurrentUser } from "@/lib/auth/current-user";
import getBrokerageAccounts from "@/services/brokerage/getBrokerageAccounts";
import getFundTransactions from "@/services/fund/getFundTransactions";
import getTaiwanFunds from "@/services/fund/getTaiwanFunds";

export const dynamic = "force-dynamic";

const FundsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?returnTo=%2Ffunds");
  }

  const [accounts, funds, transactions] = await Promise.all([
    getBrokerageAccounts(user.uid),
    getTaiwanFunds(),
    getFundTransactions(user.uid),
  ]);

  return (
    <Page breadcrumbs={[{ label: "基金", active: true }]}>
      <FundsClientPage accounts={accounts} funds={funds} transactions={transactions} />
    </Page>
  );
};

export default FundsPage;
