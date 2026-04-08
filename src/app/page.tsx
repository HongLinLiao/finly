import { AccountBalanceGrid } from "@/components/dashboard/account-balance-grid";
import { AssetValueTabs } from "@/components/dashboard/asset-value-tabs";
import { PortfolioKpiStrip } from "@/components/dashboard/portfolio-kpi-strip";
import Page from "@/components/util/Page";

import { dashboardOverviewMock } from "./mock";

function toTwdApprox(value: number, currency: string) {
  const fxToTwd: Record<string, number> = {
    TWD: 1,
    USD: 32,
    JPY: 0.22,
  };

  return value * (fxToTwd[currency] ?? 1);
}

export default function Home() {
  const breadcrumbs = [{ label: "首頁", active: true }];
  const { cashAccounts, stockValues, fundValues } = dashboardOverviewMock;

  const twdCashTotal = cashAccounts
    .filter(item => item.currency === "TWD")
    .reduce((sum, item) => sum + item.balance, 0);

  const foreignCashTotal = cashAccounts
    .filter(item => item.currency !== "TWD")
    .reduce((sum, item) => sum + toTwdApprox(item.balance, item.currency), 0);

  const stockTotalValue = stockValues.reduce(
    (sum, item) => sum + toTwdApprox(item.marketValue, item.currency),
    0
  );

  const fundTotalValue = fundValues.reduce(
    (sum, item) => sum + toTwdApprox(item.marketValue, item.currency),
    0
  );

  return (
    <Page breadcrumbs={breadcrumbs}>
      <PortfolioKpiStrip
        twdCashTotal={twdCashTotal}
        foreignCashTotal={foreignCashTotal}
        stockTotalValue={stockTotalValue}
        fundTotalValue={fundTotalValue}
      />

      <AccountBalanceGrid accounts={cashAccounts} />

      <AssetValueTabs stockValues={stockValues} fundValues={fundValues} />
    </Page>
  );
}
