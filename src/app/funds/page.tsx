"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { AddFundPositionDialog } from "@/components/fund/add-fund-position-dialog";
import { FundEmptyState } from "@/components/fund/fund-empty-state";
import { FundFilterPanel, type FundSortBy } from "@/components/fund/fund-filter-panel";
import { FundHeader } from "@/components/fund/fund-header";
import { fundPositionsMock } from "@/components/fund/fund-mock";
import { FundPositionCard } from "@/components/fund/fund-position-card";
import { FundSummaryStrip } from "@/components/fund/fund-summary-strip";
import { Button } from "@/components/ui/button";
import Page from "@/components/util/Page";

import type { FundRisk } from "@/components/fund/fund-list-data";
import type { DividendMode } from "@/types/fund";

const FundsPage = () => {
  const breadcrumbs = [{ label: "基金", active: true }];

  const [keyword, setKeyword] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<"all" | "TWD" | "USD">("all");
  const [riskFilter, setRiskFilter] = useState<"all" | FundRisk>("all");
  const [dividendFilter, setDividendFilter] = useState<"all" | DividendMode>("all");
  const [sortBy, setSortBy] = useState<FundSortBy>("marketValue");
  const [openedRows, setOpenedRows] = useState<Record<string, boolean>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredFunds = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return fundPositionsMock
      .filter(
        item =>
          normalizedKeyword.length === 0 ||
          item.name.toLowerCase().includes(normalizedKeyword) ||
          item.symbol.toLowerCase().includes(normalizedKeyword) ||
          item.fundHouse.toLowerCase().includes(normalizedKeyword)
      )
      .filter(item => currencyFilter === "all" || item.currency === currencyFilter)
      .filter(item => riskFilter === "all" || item.risk === riskFilter)
      .filter(item => dividendFilter === "all" || item.dividendMode === dividendFilter)
      .sort((a, b) => {
        const pnlA = a.marketValue - a.costAmount;
        const pnlB = b.marketValue - b.costAmount;

        if (sortBy === "return1y") return b.return1y - a.return1y;
        if (sortBy === "unrealizedPnl") return pnlB - pnlA;
        return b.marketValue - a.marketValue;
      });
  }, [currencyFilter, dividendFilter, keyword, riskFilter, sortBy]);

  const summary = useMemo(() => {
    const totals = filteredFunds.reduce(
      (acc, item) => ({
        marketValue: acc.marketValue + item.marketValue,
        costAmount: acc.costAmount + item.costAmount,
        return1y: acc.return1y + item.return1y,
      }),
      { marketValue: 0, costAmount: 0, return1y: 0 }
    );

    const count = filteredFunds.length;
    const avgReturn1y = count ? totals.return1y / count : 0;
    const unrealizedPnl = totals.marketValue - totals.costAmount;

    return { count, marketValue: totals.marketValue, unrealizedPnl, avgReturn1y };
  }, [filteredFunds]);

  return (
    <Page breadcrumbs={breadcrumbs}>
      <section className="space-y-5">
        <FundHeader />

        <FundSummaryStrip
          count={summary.count}
          marketValue={summary.marketValue}
          unrealizedPnl={summary.unrealizedPnl}
          avgReturn1y={summary.avgReturn1y}
        />

        <FundFilterPanel
          keyword={keyword}
          currencyFilter={currencyFilter}
          riskFilter={riskFilter}
          dividendFilter={dividendFilter}
          sortBy={sortBy}
          onKeywordChange={setKeyword}
          onCurrencyFilterChange={setCurrencyFilter}
          onRiskFilterChange={setRiskFilter}
          onDividendFilterChange={setDividendFilter}
          onSortByChange={setSortBy}
        />

        <div className="space-y-3">
          {filteredFunds.length === 0 ? (
            <FundEmptyState />
          ) : (
            filteredFunds.map(item => (
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
          aria-label="新增基金持倉"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus />
        </Button>

        <AddFundPositionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </section>
    </Page>
  );
};

export default FundsPage;
