import { BarChart3, ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { formatPercent } from "@/lib/format";

import { formatCurrency, formatNumber } from "./stock-transaction-data";

import type { StockPosition } from "./stock-list-data";
import type { ReactNode } from "react";

interface StockPositionCardProps {
  item: StockPosition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StockPositionCard = ({ item, open, onOpenChange }: StockPositionCardProps) => {
  const pnlColor =
    item.unrealizedPnl >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";
  const returnColor =
    item.unrealizedReturnRate >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";
  const averageCost = item.quantity > 0 ? item.costAmount / item.quantity : 0;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card className="py-4 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="px-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="relative w-full cursor-pointer space-y-3 pr-8 text-left"
              aria-label={`${item.symbol} 股票明細`}
            >
              <ChevronDown
                className={`absolute top-0.5 right-0 size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />

              <div className="space-y-1.5">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground dark:text-zinc-100">
                  <span>{item.symbol}</span>
                  {item.market ? (
                    <Badge variant="outline" className="border-border bg-muted/30 text-foreground">
                      {item.market}
                    </Badge>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground dark:text-zinc-500">
                  {formatNumber(item.quantity, 4)} 股 · {item.currency}
                </p>
              </div>

              <div className="flex items-end justify-between gap-3">
                <p className="text-xs text-muted-foreground dark:text-zinc-400">
                  目前市值 {formatCurrency(item.marketValue, item.currency)}
                </p>
                <p className={`shrink-0 text-right text-base font-semibold ${pnlColor}`}>
                  {formatCurrency(item.unrealizedPnl, item.currency)}
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
                value={formatCurrency(item.unrealizedPnl, item.currency)}
                valueClassName={pnlColor}
              />
              <DetailField
                label="未實現報酬率"
                value={formatPercent(item.unrealizedReturnRate)}
                valueClassName={returnColor}
              />
              <DetailField label="持有股數" value={`${formatNumber(item.quantity, 4)} 股`} />
              <DetailField label="平均成本" value={formatCurrency(averageCost, item.currency)} />
              <DetailField
                label="最新收盤價"
                value={
                  item.latestClose
                    ? `${formatCurrency(item.latestClose, item.currency)}${
                        item.priceDate ? ` · ${item.priceDate}` : ""
                      }`
                    : "—"
                }
              />
              <DetailField label="幣別" value={item.currency} />
              <DetailField
                label="市場"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <BarChart3 className="size-3.5" />
                    {item.market ?? "—"}
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
