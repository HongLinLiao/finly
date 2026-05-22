import { redirect } from "next/navigation";
import { Suspense } from "react";

import { FundsClientPage } from "@/components/fund/funds-client-page";
import { HoldingPageSkeleton } from "@/components/loading/page-skeletons";
import Page from "@/components/util/Page";
import { getCurrentUser } from "@/lib/auth/current-user";
import getBrokerageAccounts from "@/services/brokerage/getBrokerageAccounts";
import getFundTransactions from "@/services/fund/getFundTransactions";
import getTaiwanFunds from "@/services/fund/getTaiwanFunds";

export const dynamic = "force-dynamic";

const FundsPageContent = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?returnTo=%2Ffunds");
  }

  const [accounts, funds, transactions] = await Promise.all([
    getBrokerageAccounts(user.uid),
    getTaiwanFunds(),
    getFundTransactions(user.uid),
  ]);

  return <FundsClientPage accounts={accounts} funds={funds} transactions={transactions} />;
};

const FundsPage = () => (
  <Page breadcrumbs={[{ label: "基金", active: true }]}>
    <Suspense fallback={<HoldingPageSkeleton />}>
      <FundsPageContent />
    </Suspense>
  </Page>
);

export default FundsPage;
