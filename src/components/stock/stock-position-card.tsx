"use client";

import {
  BarChart3,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { EditStockTransactionDialog } from "@/components/stock/edit-stock-transaction-dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { formatPercent } from "@/lib/format";
import {
  deleteStockTransaction,
  type DeleteStockTransactionState,
} from "@/services/stock/deleteStockTransaction";

import { formatCurrency, formatNumber } from "./stock-transaction-data";

import type { StockPosition } from "./stock-list-data";
import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type { StockTransaction } from "@/types";
import type { ReactNode } from "react";

interface StockPositionCardProps {
  item: StockPosition;
  accounts: BrokerageAccountWithCashAccounts[];
  transactions: StockTransaction[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const deleteInitialState: DeleteStockTransactionState = {
  success: false,
  message: "",
};

function formatTransactionDate(value: number) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value * 1000));
}

export const StockPositionCard = ({
  item,
  accounts,
  transactions,
  open,
  onOpenChange,
}: StockPositionCardProps) => {
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

            <div className="mt-4 border-t pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground dark:text-zinc-100">交易紀錄</p>
                <Badge variant="outline">{transactions.length} 筆</Badge>
              </div>

              <div className="space-y-2">
                {transactions.map(transaction => (
                  <StockTransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    accounts={accounts}
                  />
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
};

function getAccountLabel(
  accounts: BrokerageAccountWithCashAccounts[],
  transaction: StockTransaction
) {
  const account = accounts.find(item => item.id === transaction.account_id);
  const cashAccount = account?.securities_cash_accounts.find(
    item => item.id === transaction.cash_account_id
  );

  if (!account) return "未知證券戶";

  return cashAccount
    ? `${account.account_name} · ${cashAccount.account_name || cashAccount.currency}`
    : account.account_name;
}

function StockTransactionRow({
  transaction,
  accounts,
}: {
  transaction: StockTransaction;
  accounts: BrokerageAccountWithCashAccounts[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isSell = transaction.side === "sell";
  const Icon = isSell ? TrendingDown : TrendingUp;
  const signedAmount = isSell ? transaction.net_amount : -transaction.net_amount;

  return (
    <>
      <EditStockTransactionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        accounts={accounts}
        transaction={transaction}
      />
      <DeleteStockTransactionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transaction={transaction}
      />

      <div className="flex items-start gap-3 rounded-2xl border bg-secondary/40 px-3 py-2.5 text-sm">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground">
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground dark:text-zinc-50">
              {isSell ? "賣出" : "買進"}
            </span>
            <Badge variant="outline">{formatTransactionDate(transaction.trade_date)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground dark:text-zinc-500">
            {getAccountLabel(accounts, transaction)}
          </p>
          <p className="text-xs text-muted-foreground dark:text-zinc-500">
            {formatNumber(transaction.quantity, 4)} 股 · 單價{" "}
            {formatCurrency(transaction.unit_price, transaction.currency)}
          </p>
        </div>

        <div className="flex shrink-0 items-start gap-1">
          <p className="pt-1 text-right font-semibold text-foreground dark:text-zinc-50">
            {formatCurrency(signedAmount, transaction.currency)}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`${formatTransactionDate(transaction.trade_date)} 股票交易操作`}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                編輯
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" />
                刪除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}

function DeleteStockTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: StockTransaction;
}) {
  const [state, formAction, isPending] = useActionState(deleteStockTransaction, deleteInitialState);

  useEffect(() => {
    if (!state.success) return;

    onOpenChange(false);
  }, [onOpenChange, state.success]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="id" value={transaction.id} />

          <AlertDialogHeader>
            <AlertDialogTitle>刪除這筆股票交易？</AlertDialogTitle>
            <AlertDialogDescription>
              這會刪除此筆股票交易與對應的資金異動紀錄。此動作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>

          {state.message && !state.success ? (
            <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              取消
            </AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "刪除中" : "刪除"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
