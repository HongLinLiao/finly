import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AccountBalanceGrid } from "@/components/dashboard/account-balance-grid";
import { AssetValueTabs } from "@/components/dashboard/asset-value-tabs";
import { NewUserGuideDialog } from "@/components/dashboard/new-user-guide-dialog";
import { PortfolioKpiStrip } from "@/components/dashboard/portfolio-kpi-strip";
import { DashboardPageSkeleton } from "@/components/loading/page-skeletons";
import Page from "@/components/util/Page";
import { getCurrentUser } from "@/lib/auth/current-user";
import { toTwdValue } from "@/lib/currency-conversion";
import { getExchangeRatesToTwd } from "@/lib/exchange-rates";
import { addMoney, divideMoney, multiplyMoney, subtractMoney } from "@/lib/money";
import { getStockPriceKey } from "@/lib/stock-price";
import { fetchYahooStockQuotes } from "@/lib/yahoo-finance";
import getBrokerageAccounts from "@/services/brokerage/getBrokerageAccounts";
import getCashAccountMovements from "@/services/cash-account/getCashAccountMovements";
import getFundTransactions from "@/services/fund/getFundTransactions";
import getTaiwanFunds from "@/services/fund/getTaiwanFunds";
import getStockTransactions from "@/services/stock/getStockTransactions";

import type { TaiwanFundOption } from "@/lib/cnyes-fund";
import type { StockPriceQuote } from "@/lib/stock-price";
import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type {
  AssetValueItem,
  CashAccountMovement,
  FundTransaction,
  OverviewCashAccount,
  StockTransaction,
} from "@/types";

export const dynamic = "force-dynamic";

function getAccountName(accounts: BrokerageAccountWithCashAccounts[], accountId: string) {
  const account = accounts.find(item => item.id === accountId);

  return account?.account_name ?? account?.broker_name ?? "未知帳戶";
}

function buildCashAccounts(
  accounts: BrokerageAccountWithCashAccounts[],
  movements: CashAccountMovement[]
) {
  const balanceByCashAccount = movements.reduce((map, movement) => {
    const signedAmount = movement.direction === "in" ? movement.amount : -movement.amount;
    map.set(
      movement.cash_account_id,
      addMoney(map.get(movement.cash_account_id) ?? 0, signedAmount)
    );

    return map;
  }, new Map<string, number>());

  return accounts.flatMap(account =>
    account.securities_cash_accounts.map<OverviewCashAccount>(cashAccount => {
      const balance = balanceByCashAccount.get(cashAccount.id) ?? 0;
      const accountName =
        cashAccount.account_name || `${account.account_name}｜${cashAccount.currency}`;

      return {
        ...cashAccount,
        account_name: accountName,
        brokerageAccountName: account.account_name,
        balance,
      };
    })
  );
}

function buildStockValues(
  accounts: BrokerageAccountWithCashAccounts[],
  transactions: StockTransaction[],
  quotes: StockPriceQuote[],
  ratesToTwd: Record<string, number>
) {
  const quoteMap = new Map(quotes.map(quote => [quote.key, quote]));
  const positionMap = new Map<
    string,
    {
      accountId: string;
      symbol: string;
      market?: string;
      currency: string;
      quantity: number;
      cost: number;
    }
  >();

  [...transactions]
    .sort((a, b) => a.trade_date - b.trade_date || a.created_at - b.created_at)
    .forEach(transaction => {
      const priceKey = getStockPriceKey(transaction);
      const positionKey = `${transaction.account_id}|${priceKey}`;
      const existing =
        positionMap.get(positionKey) ??
        ({
          accountId: transaction.account_id,
          symbol: transaction.symbol,
          market: transaction.market,
          currency: transaction.currency,
          quantity: 0,
          cost: 0,
        } satisfies {
          accountId: string;
          symbol: string;
          market?: string;
          currency: string;
          quantity: number;
          cost: number;
        });

      if (transaction.side === "sell") {
        const averageCost =
          existing.quantity > 0 ? divideMoney(existing.cost, existing.quantity) : 0;
        const soldQuantity = Math.min(transaction.quantity, existing.quantity);

        existing.quantity = subtractMoney(existing.quantity, transaction.quantity);
        existing.cost =
          existing.quantity > 0
            ? subtractMoney(existing.cost, multiplyMoney(averageCost, soldQuantity))
            : 0;
      } else {
        existing.quantity = addMoney(existing.quantity, transaction.quantity);
        existing.cost = addMoney(existing.cost, transaction.net_amount);
      }

      positionMap.set(positionKey, existing);
    });

  const assetMap = new Map<string, AssetValueItem>();

  Array.from(positionMap.values())
    .filter(position => position.quantity > 0)
    .forEach(position => {
      const priceKey = getStockPriceKey(position);
      const quote = quoteMap.get(priceKey);
      const marketValue = quote?.close
        ? multiplyMoney(position.quantity, quote.close)
        : position.cost;
      const assetKey = `${position.symbol}|${position.market ?? ""}|${position.currency}`;
      const asset =
        assetMap.get(assetKey) ??
        ({
          code: position.symbol,
          name: position.symbol,
          marketValue: 0,
          cost: 0,
          unrealizedReturnRate: 0,
          currency: position.currency,
          accountValues: [],
        } satisfies AssetValueItem);

      asset.marketValue = addMoney(asset.marketValue, marketValue);
      asset.cost = addMoney(asset.cost, position.cost);
      asset.accountValues.push({
        accountId: position.accountId,
        accountName: getAccountName(accounts, position.accountId),
        marketValue,
      });
      assetMap.set(assetKey, asset);
    });

  return Array.from(assetMap.values())
    .map(item => ({
      ...item,
      unrealizedReturnRate:
        item.cost > 0
          ? multiplyMoney(divideMoney(subtractMoney(item.marketValue, item.cost), item.cost), 100)
          : 0,
    }))
    .sort(
      (a, b) =>
        toTwdValue(b.marketValue, b.currency, ratesToTwd) -
        toTwdValue(a.marketValue, a.currency, ratesToTwd)
    );
}

function buildFundValues(
  accounts: BrokerageAccountWithCashAccounts[],
  transactions: FundTransaction[],
  funds: TaiwanFundOption[],
  ratesToTwd: Record<string, number>
) {
  const fundMap = new Map(funds.map(fund => [fund.fundCode, fund]));
  const positionMap = new Map<
    string,
    {
      accountId: string;
      fundCode: string;
      currency: string;
      quantity: number;
      cost: number;
    }
  >();

  [...transactions]
    .sort((a, b) => a.trade_date - b.trade_date || a.created_at - b.created_at)
    .forEach(transaction => {
      const positionKey = `${transaction.account_id}|${transaction.fund_code}`;
      const existing =
        positionMap.get(positionKey) ??
        ({
          accountId: transaction.account_id,
          fundCode: transaction.fund_code,
          currency: transaction.currency,
          quantity: 0,
          cost: 0,
        } satisfies {
          accountId: string;
          fundCode: string;
          currency: string;
          quantity: number;
          cost: number;
        });

      if (transaction.side === "sell") {
        const averageCost =
          existing.quantity > 0 ? divideMoney(existing.cost, existing.quantity) : 0;
        const soldQuantity = Math.min(transaction.quantity, existing.quantity);

        existing.quantity = subtractMoney(existing.quantity, transaction.quantity);
        existing.cost =
          existing.quantity > 0
            ? subtractMoney(existing.cost, multiplyMoney(averageCost, soldQuantity))
            : 0;
      } else {
        existing.quantity = addMoney(existing.quantity, transaction.quantity);
        existing.cost = addMoney(existing.cost, transaction.net_amount);
      }

      existing.currency = transaction.currency;
      positionMap.set(positionKey, existing);
    });

  const assetMap = new Map<string, AssetValueItem>();

  Array.from(positionMap.values())
    .filter(position => position.quantity > 0)
    .forEach(position => {
      const fund = fundMap.get(position.fundCode);
      const marketValue = fund?.latestNav
        ? multiplyMoney(position.quantity, fund.latestNav)
        : position.cost;
      const asset =
        assetMap.get(position.fundCode) ??
        ({
          code: position.fundCode,
          name: fund?.fundName ?? position.fundCode,
          marketValue: 0,
          cost: 0,
          unrealizedReturnRate: 0,
          currency: (fund?.currency ?? position.currency) as string,
          accountValues: [],
        } satisfies AssetValueItem);

      asset.marketValue = addMoney(asset.marketValue, marketValue);
      asset.cost = addMoney(asset.cost, position.cost);
      asset.accountValues.push({
        accountId: position.accountId,
        accountName: getAccountName(accounts, position.accountId),
        marketValue,
      });
      assetMap.set(position.fundCode, asset);
    });

  return Array.from(assetMap.values())
    .map(item => ({
      ...item,
      unrealizedReturnRate:
        item.cost > 0
          ? multiplyMoney(divideMoney(subtractMoney(item.marketValue, item.cost), item.cost), 100)
          : 0,
    }))
    .sort(
      (a, b) =>
        toTwdValue(b.marketValue, b.currency, ratesToTwd) -
        toTwdValue(a.marketValue, a.currency, ratesToTwd)
    );
}

async function HomeContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?returnTo=%2F");
  }

  const [accounts, cashMovements, stockTransactions, fundTransactions, funds] = await Promise.all([
    getBrokerageAccounts(user.uid),
    getCashAccountMovements(user.uid),
    getStockTransactions(user.uid),
    getFundTransactions(user.uid),
    getTaiwanFunds(),
  ]);

  const quotes = await fetchYahooStockQuotes(
    stockTransactions.map(transaction => ({
      symbol: transaction.symbol,
      market: transaction.market,
      currency: transaction.currency,
    }))
  );

  const currencies = [
    ...cashMovements.map(movement => movement.currency),
    ...stockTransactions.map(transaction => transaction.currency),
    ...fundTransactions.map(transaction => transaction.currency),
    ...funds.map(fund => fund.currency),
  ];
  const ratesToTwd = await getExchangeRatesToTwd(currencies);

  const cashAccounts = buildCashAccounts(accounts, cashMovements);
  const stockValues = buildStockValues(accounts, stockTransactions, quotes, ratesToTwd);
  const fundValues = buildFundValues(accounts, fundTransactions, funds, ratesToTwd);

  const twd_cash_total = cashAccounts
    .filter(item => item.currency === "TWD")
    .reduce((sum, item) => addMoney(sum, item.balance), 0);

  const foreign_cash_total = cashAccounts
    .filter(item => item.currency !== "TWD")
    .reduce((sum, item) => addMoney(sum, toTwdValue(item.balance, item.currency, ratesToTwd)), 0);

  const stock_total_value = stockValues.reduce(
    (sum, item) => addMoney(sum, toTwdValue(item.marketValue, item.currency, ratesToTwd)),
    0
  );

  const fund_total_value = fundValues.reduce(
    (sum, item) => addMoney(sum, toTwdValue(item.marketValue, item.currency, ratesToTwd)),
    0
  );

  return (
    <>
      <NewUserGuideDialog isNewUser={accounts.length === 0} />

      <PortfolioKpiStrip
        twdCashTotal={twd_cash_total}
        foreignCashTotal={foreign_cash_total}
        stockTotalValue={stock_total_value}
        fundTotalValue={fund_total_value}
      />

      <AccountBalanceGrid accounts={cashAccounts} />

      <AssetValueTabs stockValues={stockValues} fundValues={fundValues} />
    </>
  );
}

export default function Home() {
  return (
    <Page breadcrumbs={[{ label: "首頁", active: true }]}>
      <Suspense fallback={<DashboardPageSkeleton />}>
        <HomeContent />
      </Suspense>
    </Page>
  );
}
