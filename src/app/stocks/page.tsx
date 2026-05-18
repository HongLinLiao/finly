import { redirect } from "next/navigation";

import { StocksClientPage } from "@/components/stock/stocks-client-page";
import Page from "@/components/util/Page";
import { getCurrentUser } from "@/lib/auth/current-user";
import { fetchYahooStockQuotes } from "@/lib/yahoo-finance";
import getBrokerageAccounts from "@/services/brokerage/getBrokerageAccounts";
import getStockTransactions from "@/services/stock/getStockTransactions";

export const dynamic = "force-dynamic";

const StocksPage = async () => {
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

  return (
    <Page breadcrumbs={[{ label: "股票", active: true }]}>
      <StocksClientPage accounts={accounts} transactions={transactions} quotes={quotes} />
    </Page>
  );
};

export default StocksPage;
