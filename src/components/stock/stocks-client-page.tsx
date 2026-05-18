"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { AddStockTransactionDialog } from "@/components/stock/add-stock-transaction-dialog";
import { StockHeader } from "@/components/stock/stock-header";
import { StockPositionCard } from "@/components/stock/stock-position-card";
import { StockSummaryStrip } from "@/components/stock/stock-summary-strip";
import { StockTransactionEmpty } from "@/components/stock/stock-transaction-empty";
import { Button } from "@/components/ui/button";
import { toTwdValue } from "@/lib/currency-conversion";
import { getStockPriceKey } from "@/lib/stock-price";

import type { StockPosition } from "@/components/stock/stock-list-data";
import type { StockPriceQuote } from "@/lib/stock-price";
import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type { StockTransaction } from "@/types";

interface StocksClientPageProps {
  accounts: BrokerageAccountWithCashAccounts[];
  transactions: StockTransaction[];
  quotes: StockPriceQuote[];
  ratesToTwd: Record<string, number>;
}

function buildStockPositions(transactions: StockTransaction[], quotes: StockPriceQuote[]) {
  const quoteMap = new Map(quotes.map(quote => [quote.key, quote]));
  const positionMap = new Map<
    string,
    {
      symbol: string;
      market?: string;
      currency: string;
      quantity: number;
      costAmount: number;
    }
  >();

  const chronologicalTransactions = [...transactions].sort(
    (a, b) => a.trade_date - b.trade_date || a.created_at - b.created_at
  );

  chronologicalTransactions.forEach(transaction => {
    const key = getStockPriceKey(transaction);
    const existing =
      positionMap.get(key) ??
      ({
        symbol: transaction.symbol,
        market: transaction.market,
        currency: transaction.currency,
        quantity: 0,
        costAmount: 0,
      } satisfies {
        symbol: string;
        market?: string;
        currency: string;
        quantity: number;
        costAmount: number;
      });

    if (transaction.side === "sell") {
      const averageCost = existing.quantity > 0 ? existing.costAmount / existing.quantity : 0;
      const soldQuantity = Math.min(transaction.quantity, existing.quantity);

      existing.quantity -= transaction.quantity;
      existing.costAmount =
        existing.quantity > 0 ? existing.costAmount - averageCost * soldQuantity : 0;
    } else {
      existing.quantity += transaction.quantity;
      existing.costAmount += transaction.net_amount;
    }

    positionMap.set(key, existing);
  });

  return Array.from(positionMap.entries())
    .filter(([, position]) => position.quantity > 0)
    .map<StockPosition>(([key, position]) => {
      const quote = quoteMap.get(key);
      const marketValue = quote?.close ? position.quantity * quote.close : position.costAmount;
      const unrealizedPnl = marketValue - position.costAmount;
      const unrealizedReturnRate =
        position.costAmount > 0 ? (unrealizedPnl / position.costAmount) * 100 : 0;

      return {
        ...position,
        key,
        latestClose: quote?.close ?? null,
        priceDate: quote?.priceDate,
        marketValue,
        unrealizedPnl,
        unrealizedReturnRate,
      };
    })
    .sort((a, b) => b.marketValue - a.marketValue);
}

export function StocksClientPage({
  accounts,
  transactions,
  quotes,
  ratesToTwd,
}: StocksClientPageProps) {
  const [openedRows, setOpenedRows] = useState<Record<string, boolean>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const positions = useMemo(
    () => buildStockPositions(transactions, quotes),
    [quotes, transactions]
  );

  const summary = useMemo(() => {
    const totals = positions.reduce(
      (acc, item) => ({
        marketValue: acc.marketValue + toTwdValue(item.marketValue, item.currency, ratesToTwd),
        costAmount: acc.costAmount + toTwdValue(item.costAmount, item.currency, ratesToTwd),
      }),
      { marketValue: 0, costAmount: 0 }
    );
    const count = positions.length;
    const unrealizedPnl = totals.marketValue - totals.costAmount;
    const unrealizedReturnRate =
      totals.costAmount > 0 ? (unrealizedPnl / totals.costAmount) * 100 : 0;

    return {
      count,
      marketValue: totals.marketValue,
      unrealizedPnl,
      unrealizedReturnRate,
    };
  }, [positions, ratesToTwd]);

  return (
    <section className="space-y-5">
      <StockHeader />

      <StockSummaryStrip
        count={summary.count}
        marketValue={summary.marketValue}
        unrealizedPnl={summary.unrealizedPnl}
        unrealizedReturnRate={summary.unrealizedReturnRate}
      />

      <div className="space-y-3">
        {positions.length === 0 ? (
          <StockTransactionEmpty />
        ) : (
          positions.map(item => (
            <StockPositionCard
              key={item.key}
              item={item}
              open={!!openedRows[item.key]}
              onOpenChange={open => {
                setOpenedRows(prev => ({ ...prev, [item.key]: open }));
              }}
            />
          ))
        )}
      </div>

      <Button
        size="icon-lg"
        className="fixed right-4 z-40 bottom-[calc(env(safe-area-inset-bottom)+98px)] rounded-full shadow-lg ring-1 ring-emerald-500/45 md:right-6 md:bottom-6"
        aria-label="新增股票交易明細"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Plus />
      </Button>

      <AddStockTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        accounts={accounts}
      />
    </section>
  );
}
