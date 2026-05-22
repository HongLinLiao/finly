import { redirect } from "next/navigation";

import { CashMovementRecordsClient } from "@/components/brokerage/cash-movement-records-client";
import Page from "@/components/util/Page";
import { getCurrentUser } from "@/lib/auth/current-user";
import getBrokerageAccounts from "@/services/brokerage/getBrokerageAccounts";
import getCashAccountMovements from "@/services/cash-account/getCashAccountMovements";
import getFundTransactions from "@/services/fund/getFundTransactions";
import getTaiwanFunds from "@/services/fund/getTaiwanFunds";
import getStockTransactions from "@/services/stock/getStockTransactions";

export const dynamic = "force-dynamic";

type BrokerageRecordsPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
};

function getCurrentTaipeiYearMonth() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());

  return {
    year: Number(parts.find(part => part.type === "year")?.value),
    month: Number(parts.find(part => part.type === "month")?.value),
  };
}

function normalizeYearMonth(yearValue?: string, monthValue?: string) {
  const current = getCurrentTaipeiYearMonth();
  const year = Number(yearValue);
  const month = Number(monthValue);

  return {
    year: Number.isInteger(year) && year >= 1970 && year <= 9999 ? year : current.year,
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : current.month,
  };
}

function getTaipeiMonthRange(year: number, month: number) {
  const start = new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00.000+08:00`);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthText = String(nextMonth).padStart(2, "0");
  const end = new Date(`${nextYear}-${nextMonthText}-01T00:00:00.000+08:00`);

  return {
    occurredAtFrom: start.toISOString(),
    occurredAtTo: end.toISOString(),
  };
}

const BrokerageRecordsPage = async ({ searchParams }: BrokerageRecordsPageProps) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?returnTo=%2Fbrokerages%2Frecords");
  }

  const params = await searchParams;
  const { year, month } = normalizeYearMonth(params?.year, params?.month);
  const range = getTaipeiMonthRange(year, month);

  const [accounts, movements, stockTransactions, fundTransactions, funds] = await Promise.all([
    getBrokerageAccounts(user.uid),
    getCashAccountMovements(user.uid, range),
    getStockTransactions(user.uid, {
      tradeDateFrom: range.occurredAtFrom,
      tradeDateTo: range.occurredAtTo,
    }),
    getFundTransactions(user.uid, {
      tradeDateFrom: range.occurredAtFrom,
      tradeDateTo: range.occurredAtTo,
    }),
    getTaiwanFunds(),
  ]);

  return (
    <Page breadcrumbs={[{ label: "帳戶交易", active: true }]}>
      <CashMovementRecordsClient
        accounts={accounts}
        fundTransactions={fundTransactions}
        funds={funds}
        movements={movements}
        stockTransactions={stockTransactions}
        year={year}
        month={month}
      />
    </Page>
  );
};

export default BrokerageRecordsPage;
