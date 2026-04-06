import { ArrowDownLeft, ArrowUpRight, ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

import { stockAccounts } from "./stock-mock";
import {
  boardLotLabels,
  formatCurrency,
  formatDateTime,
  formatNumber,
  sideLabels,
} from "./stock-transaction-data";

import type { StockTransaction } from "@/types";

interface StockTransactionItemProps {
  item: StockTransaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockTransactionItem({ item, open, onOpenChange }: StockTransactionItemProps) {
  const account = stockAccounts.find(accountItem => accountItem.id === item.accountId);
  const sideIsBuy = item.side === "buy";

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card className="border border-zinc-800/85 bg-zinc-950/75 py-4 transition-colors hover:border-zinc-600/90">
        <CardContent className="px-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="relative w-full cursor-pointer space-y-3 pr-8 text-left"
              aria-label={`${item.symbol} ${sideLabels[item.side]} 交易明細`}
            >
              <ChevronDown
                className={`absolute top-0.5 right-0 size-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />

              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-xl ${
                    sideIsBuy
                      ? "bg-emerald-500/12 text-emerald-300"
                      : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {sideIsBuy ? (
                    <ArrowDownLeft className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </span>

                <div className="min-w-0 space-y-1.5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                    <span>{item.symbol}</span>
                    <Badge
                      variant="secondary"
                      className={
                        sideIsBuy
                          ? "border-0 bg-emerald-500/15 text-emerald-300"
                          : "border-0 bg-rose-500/15 text-rose-300"
                      }
                    >
                      {sideLabels[item.side]}
                    </Badge>
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-zinc-700 bg-zinc-900/70 text-zinc-300"
                    >
                      {boardLotLabels[item.boardLotType ?? "regular"]}
                    </Badge>
                    {item.market ? (
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-900/70 text-zinc-300"
                      >
                        {item.market}
                      </Badge>
                    ) : null}
                  </div>

                  <p className="truncate text-xs text-zinc-400 sm:whitespace-normal">
                    {account?.accountName ?? account?.brokerName ?? "未知帳戶"} ·{" "}
                    {formatDateTime(item.tradeDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-end justify-between gap-3 pl-12">
                <p className="text-xs text-zinc-400">
                  {formatNumber(item.quantity)} 股 · 單價{" "}
                  {formatCurrency(item.unitPrice, item.currency)}
                </p>
                <p className="shrink-0 text-right text-base font-semibold text-zinc-100 sm:text-sm">
                  {formatCurrency(item.netAmount, item.currency)}
                </p>
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-4">
            <Separator className="mb-4 bg-zinc-800" />
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="交易編號" value={item.id} />
              <DetailField label="市場" value={item.market ?? "—"} />
              <DetailField
                label="交割日"
                value={item.settleDate ? formatDateTime(item.settleDate) : "—"}
              />
              <DetailField
                label="成交金額"
                value={formatCurrency(item.grossAmount, item.currency)}
              />
              <DetailField label="手續費" value={formatCurrency(item.fee ?? 0, item.currency)} />
              <DetailField label="稅額" value={formatCurrency(item.tax ?? 0, item.currency)} />
              <DetailField
                label="建立時間"
                value={item.createdAt ? formatDateTime(item.createdAt) : "—"}
              />
              <DetailField
                label="更新時間"
                value={item.updatedAt ? formatDateTime(item.updatedAt) : "—"}
              />
              <DetailField label="備註" value={item.note ?? "—"} />
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 break-all text-sm text-zinc-100">{value}</p>
    </div>
  );
}
