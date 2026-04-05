import { AccountBalanceGrid } from "@/components/dashboard/account-balance-grid";
import { AssetValueTabs } from "@/components/dashboard/asset-value-tabs";
import { PortfolioKpiStrip } from "@/components/dashboard/portfolio-kpi-strip";

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
    <div className="dark relative min-h-screen overflow-hidden bg-black text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(82,82,91,0.2),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(63,63,70,0.18),transparent_28%),linear-gradient(180deg,#020202_0%,#090909_48%,#000000_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(63,63,70,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(63,63,70,0.25)_1px,transparent_1px)] [background-size:28px_28px]" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <PortfolioKpiStrip
          twdCashTotal={twdCashTotal}
          foreignCashTotal={foreignCashTotal}
          stockTotalValue={stockTotalValue}
          fundTotalValue={fundTotalValue}
        />

        <AccountBalanceGrid accounts={cashAccounts} />

        <AssetValueTabs stockValues={stockValues} fundValues={fundValues} />
      </main>
    </div>
  );
}
