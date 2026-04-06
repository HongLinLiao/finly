"use client";

import { useMemo, useState } from "react";

import { StockFilterPanel } from "@/components/stock/stock-filter-panel";
import { stockAccounts, stockTransactions } from "@/components/stock/stock-mock";
import { StockTransactionEmpty } from "@/components/stock/stock-transaction-empty";
import { StockTransactionItem } from "@/components/stock/stock-transaction-item";
import Page from "@/components/util/Page";

const Stocks = () => {
  const [accountFilter, setAccountFilter] = useState("all");
  const [sideFilter, setSideFilter] = useState("all");
  const [symbolFilter, setSymbolFilter] = useState("all");
  const [openedRows, setOpenedRows] = useState<Record<string, boolean>>({});

  const symbols = useMemo(
    () => Array.from(new Set(stockTransactions.map(item => item.symbol))).sort(),
    []
  );

  const filteredTransactions = useMemo(
    () =>
      stockTransactions
        .filter(item => accountFilter === "all" || item.accountId === accountFilter)
        .filter(item => sideFilter === "all" || item.side === sideFilter)
        .filter(item => symbolFilter === "all" || item.symbol === symbolFilter)
        .sort((a, b) => b.tradeDate - a.tradeDate),
    [accountFilter, sideFilter, symbolFilter]
  );

  const summary = useMemo(() => {
    const buyCount = filteredTransactions.filter(item => item.side === "buy").length;
    const sellCount = filteredTransactions.filter(item => item.side === "sell").length;
    const totalNet = filteredTransactions.reduce((sum, item) => sum + item.netAmount, 0);
    const currency = filteredTransactions[0]?.currency ?? "TWD";

    return { buyCount, sellCount, totalNet, currency };
  }, [filteredTransactions]);

  return (
    <Page>
      <section className="space-y-5">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground dark:text-zinc-50">
            股票交易明細
          </h1>
        </header>

        <StockFilterPanel
          accounts={stockAccounts}
          symbols={symbols}
          accountFilter={accountFilter}
          sideFilter={sideFilter}
          symbolFilter={symbolFilter}
          onAccountFilterChange={setAccountFilter}
          onSideFilterChange={setSideFilter}
          onSymbolFilterChange={setSymbolFilter}
          count={filteredTransactions.length}
          buyCount={summary.buyCount}
          sellCount={summary.sellCount}
          totalNet={summary.totalNet}
          currency={summary.currency}
        />

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <StockTransactionEmpty />
          ) : (
            filteredTransactions.map(item => (
              <StockTransactionItem
                key={item.id}
                item={item}
                open={!!openedRows[item.id]}
                onOpenChange={open => {
                  setOpenedRows(prev => ({ ...prev, [item.id]: open }));
                }}
              />
            ))
          )}
        </div>
      </section>
    </Page>
  );
};

export default Stocks;
