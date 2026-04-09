import { BadgeDollarSign, ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

import { formatCurrency, formatPercent } from "./fund-format";

import type { FundPosition } from "./fund-list-data";
import type { ReactNode } from "react";

interface FundPositionCardProps {
  item: FundPosition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FundPositionCard = ({ item, open, onOpenChange }: FundPositionCardProps) => {
  const unrealizedPnl = item.marketValue - item.costAmount;
  const pnlColor = unrealizedPnl >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";
  const returnColor =
    item.return1y >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";
  const dividendLabel = item.dividendMode === "cash" ? "現金配息" : "配息再投入";

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card className="py-4 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="px-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="relative w-full cursor-pointer space-y-3 pr-8 text-left"
              aria-label={`${item.name} 基金明細`}
            >
              <ChevronDown
                className={`absolute top-0.5 right-0 size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />

              <div className="space-y-1.5">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground dark:text-zinc-100">
                  <span>{item.name}</span>
                  <Badge variant="outline" className="border-border bg-muted/30 text-foreground">
                    {item.symbol}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground dark:text-zinc-500">
                  {item.fundHouse} · {item.risk} · {dividendLabel} · {item.currency}
                </p>
              </div>

              <div className="flex items-end justify-between gap-3">
                <p className="text-xs text-muted-foreground dark:text-zinc-400">
                  目前市值 {formatCurrency(item.marketValue, item.currency)}
                </p>
                <p className={`shrink-0 text-right text-base font-semibold ${pnlColor}`}>
                  {formatCurrency(unrealizedPnl, item.currency)}
                </p>
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-4">
            <Separator className="mb-4" />
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <DetailField
                label="持有成本"
                value={formatCurrency(item.costAmount, item.currency)}
              />
              <DetailField
                label="目前市值"
                value={formatCurrency(item.marketValue, item.currency)}
              />
              <DetailField
                label="未實現損益"
                value={formatCurrency(unrealizedPnl, item.currency)}
                valueClassName={pnlColor}
              />
              <DetailField
                label="一年報酬"
                value={formatPercent(item.return1y)}
                valueClassName={returnColor}
              />
              <DetailField label="近一月報酬" value={formatPercent(item.return1m)} />
              <DetailField label="配息方式" value={dividendLabel} />
              <DetailField label="風險等級" value={item.risk} />
              <DetailField label="幣別" value={item.currency} />
              <DetailField
                label="基金公司"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <BadgeDollarSign className="size-3.5" />
                    {item.fundHouse}
                  </span>
                }
              />
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
};

function DetailField({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-muted/60 px-3 py-2.5 dark:border-white/10 dark:bg-zinc-900/75">
      <p className="text-xs text-muted-foreground dark:text-zinc-500">{label}</p>
      <p
        className={`mt-1 break-all text-sm text-foreground dark:text-zinc-100 ${valueClassName ?? ""}`}
      >
        {value}
      </p>
    </div>
  );
}
