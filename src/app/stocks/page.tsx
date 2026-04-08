"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { AddStockTransactionDialog } from "@/components/stock/add-stock-transaction-dialog";
import { StockFilterPanel } from "@/components/stock/stock-filter-panel";
import { stockAccounts, stockTransactions } from "@/components/stock/stock-mock";
import { StockTransactionEmpty } from "@/components/stock/stock-transaction-empty";
import { StockTransactionItem } from "@/components/stock/stock-transaction-item";
import { Button } from "@/components/ui/button";
import Page from "@/components/util/Page";

const Stocks = () => {
  const breadcrumbs = [{ label: "股票", active: true }];
  const [accountFilter, setAccountFilter] = useState("all");
  const [sideFilter, setSideFilter] = useState("all");
  const [symbolFilter, setSymbolFilter] = useState("all");
  const [openedRows, setOpenedRows] = useState<Record<string, boolean>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
    <Page breadcrumbs={breadcrumbs}>
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

        <Button
          size="icon-lg"
          className="fixed right-4 z-40 bottom-[calc(env(safe-area-inset-bottom)+98px)] rounded-full shadow-lg ring-1 ring-emerald-500/45 md:bottom-6 md:right-6"
          aria-label="新增股票交易明細"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus />
        </Button>

        <AddStockTransactionDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          accounts={stockAccounts}
        />
      </section>
    </Page>
  );
};

export default Stocks;
