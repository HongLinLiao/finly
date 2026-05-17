"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { AddFundTransactionDialog } from "@/components/fund/add-fund-transaction-dialog";
import { FundEmptyState } from "@/components/fund/fund-empty-state";
import { FundHeader } from "@/components/fund/fund-header";
import { FundPositionCard } from "@/components/fund/fund-position-card";
import { FundSummaryStrip } from "@/components/fund/fund-summary-strip";
import { Button } from "@/components/ui/button";

import type { FundPosition } from "@/components/fund/fund-list-data";
import type { TaiwanFundOption } from "@/lib/cnyes-fund";
import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type { FundTransaction } from "@/types";

interface FundsClientPageProps {
  accounts: BrokerageAccountWithCashAccounts[];
  funds: TaiwanFundOption[];
  transactions: FundTransaction[];
}

function buildFundPositions(transactions: FundTransaction[], funds: TaiwanFundOption[]) {
  const fundMap = new Map(funds.map(fund => [fund.fundCode, fund]));
  const positionMap = new Map<
    string,
    {
      fundCode: string;
      quantity: number;
      costAmount: number;
      dividendMode: FundTransaction["dividend_mode"];
      currency: string;
    }
  >();

  transactions.forEach(transaction => {
    const existing =
      positionMap.get(transaction.fund_code) ??
      ({
        fundCode: transaction.fund_code,
        quantity: 0,
        costAmount: 0,
        dividendMode: transaction.dividend_mode,
        currency: transaction.currency,
      } satisfies {
        fundCode: string;
        quantity: number;
        costAmount: number;
        dividendMode: FundTransaction["dividend_mode"];
        currency: string;
      });

    const signedQuantity =
      transaction.side === "sell" ? -transaction.quantity : transaction.quantity;
    const signedCost =
      transaction.side === "sell" ? -transaction.net_amount : transaction.net_amount;

    existing.quantity += signedQuantity;
    existing.costAmount += signedCost;
    existing.dividendMode = transaction.dividend_mode ?? existing.dividendMode;
    existing.currency = transaction.currency;
    positionMap.set(transaction.fund_code, existing);
  });

  return Array.from(positionMap.values())
    .filter(position => position.quantity > 0)
    .map<FundPosition>(position => {
      const fund = fundMap.get(position.fundCode);
      const latestNav = fund?.latestNav ?? 0;
      const marketValue = position.quantity * latestNav;
      const returnRate =
        position.costAmount > 0
          ? ((marketValue - position.costAmount) / position.costAmount) * 100
          : 0;

      return {
        id: position.fundCode,
        name: fund?.fundName ?? position.fundCode,
        symbol: position.fundCode,
        fundHouse: fund?.companyName ?? "未知投信",
        risk: "RR3",
        dividendMode: position.dividendMode ?? "accumulation",
        currency: (fund?.currency ?? position.currency) as FundPosition["currency"],
        costAmount: position.costAmount,
        marketValue,
        return1m: returnRate,
        return1y: returnRate,
      };
    })
    .sort((a, b) => b.marketValue - a.marketValue);
}

export function FundsClientPage({ accounts, funds, transactions }: FundsClientPageProps) {
  const [openedRows, setOpenedRows] = useState<Record<string, boolean>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const positions = useMemo(() => buildFundPositions(transactions, funds), [funds, transactions]);

  const summary = useMemo(() => {
    const totals = positions.reduce(
      (acc, item) => ({
        marketValue: acc.marketValue + item.marketValue,
        costAmount: acc.costAmount + item.costAmount,
        return1y: acc.return1y + item.return1y,
      }),
      { marketValue: 0, costAmount: 0, return1y: 0 }
    );

    const count = positions.length;
    const avgReturn1y = count ? totals.return1y / count : 0;
    const unrealizedPnl = totals.marketValue - totals.costAmount;

    return { count, marketValue: totals.marketValue, unrealizedPnl, avgReturn1y };
  }, [positions]);

  return (
    <section className="space-y-5">
      <FundHeader />

      <FundSummaryStrip
        count={summary.count}
        marketValue={summary.marketValue}
        unrealizedPnl={summary.unrealizedPnl}
        avgReturn1y={summary.avgReturn1y}
      />

      <div className="space-y-3">
        {positions.length === 0 ? (
          <FundEmptyState />
        ) : (
          positions.map(item => (
            <FundPositionCard
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
        className="fixed right-4 z-40 bottom-[calc(env(safe-area-inset-bottom)+98px)] rounded-full shadow-lg ring-1 ring-emerald-500/45 md:right-6 md:bottom-6"
        aria-label="新增基金交易明細"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Plus />
      </Button>

      <AddFundTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        accounts={accounts}
        funds={funds}
      />
    </section>
  );
}
