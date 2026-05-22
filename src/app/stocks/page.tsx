import { redirect } from "next/navigation";
import { Suspense } from "react";

import { HoldingPageSkeleton } from "@/components/loading/page-skeletons";
import { StocksClientPage } from "@/components/stock/stocks-client-page";
import Page from "@/components/util/Page";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getExchangeRatesToTwd } from "@/lib/exchange-rates";
import { fetchYahooStockQuotes } from "@/lib/yahoo-finance";
import getBrokerageAccounts from "@/services/brokerage/getBrokerageAccounts";
import getStockTransactions from "@/services/stock/getStockTransactions";

export const dynamic = "force-dynamic";

const StocksPageContent = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?returnTo=%2Fstocks");
  }

  const [accounts, transactions] = await Promise.all([
    getBrokerageAccounts(user.uid),
    getStockTransactions(user.uid),
  ]);

  const quotes = await fetchYahooStockQuotes(
    transactions.map(transaction => ({
      symbol: transaction.symbol,
      market: transaction.market,
      currency: transaction.currency,
    }))
  );
  const ratesToTwd = await getExchangeRatesToTwd(
    transactions.map(transaction => transaction.currency)
  );

  return (
    <StocksClientPage
      accounts={accounts}
      transactions={transactions}
      quotes={quotes}
      ratesToTwd={ratesToTwd}
    />
  );
};

const StocksPage = () => (
  <Page breadcrumbs={[{ label: "股票", active: true }]}>
    <Suspense fallback={<HoldingPageSkeleton />}>
      <StocksPageContent />
    </Suspense>
  </Page>
);

export default StocksPage;
