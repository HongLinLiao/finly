"use client";

import {
  BadgeDollarSign,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { EditFundTransactionDialog } from "@/components/fund/edit-fund-transaction-dialog";
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
import { formatCurrency, formatPercent, formatPrice } from "@/lib/format";
import {
  deleteFundTransaction,
  type DeleteFundTransactionState,
} from "@/services/fund/deleteFundTransaction";
import { getDividendModeLabel } from "@/types/fund";

import type { FundPosition } from "./fund-list-data";
import type { TaiwanFundOption } from "@/lib/cnyes-fund";
import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type { FundTransaction } from "@/types";
import type { ReactNode } from "react";

interface FundPositionCardProps {
  item: FundPosition;
  accounts: BrokerageAccountWithCashAccounts[];
  funds: TaiwanFundOption[];
  transactions: FundTransaction[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const deleteInitialState: DeleteFundTransactionState = {
  success: false,
  message: "",
};

const transactionTypeLabel: Record<string, string> = {
  subscribe: "申購",
  redeem: "贖回",
  "switch-in": "轉入",
  "switch-out": "轉出",
};

function formatTransactionDate(value: number) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value * 1000));
}

export const FundPositionCard = ({
  item,
  accounts,
  funds,
  transactions,
  open,
  onOpenChange,
}: FundPositionCardProps) => {
  const unrealizedPnl = item.marketValue - item.costAmount;
  const pnlColor = unrealizedPnl >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";
  const returnColor =
    item.unrealizedReturnRate >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";
  const dividendLabel = getDividendModeLabel(item.dividendMode);

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

              <div className="min-w-0 space-y-1.5">
                <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground dark:text-zinc-100">
                  <span className="min-w-0 truncate">{item.name}</span>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-border bg-muted/30 text-foreground"
                  >
                    {item.symbol}
                  </Badge>
                </p>
                <p className="truncate text-xs text-muted-foreground dark:text-zinc-500">
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
              <DetailField label="持有單位" value={item.quantity.toLocaleString("zh-TW")} />
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
                label="未實現報酬率"
                value={formatPercent(item.unrealizedReturnRate)}
                valueClassName={returnColor}
              />
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

            <div className="mt-4 border-t pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground dark:text-zinc-100">交易紀錄</p>
                <Badge variant="outline">{transactions.length} 筆</Badge>
              </div>

              <div className="space-y-2">
                {transactions.map(transaction => (
                  <FundTransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    accounts={accounts}
                    funds={funds}
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
  transaction: FundTransaction
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

function FundTransactionRow({
  transaction,
  accounts,
  funds,
}: {
  transaction: FundTransaction;
  accounts: BrokerageAccountWithCashAccounts[];
  funds: TaiwanFundOption[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isSell = transaction.side === "sell";
  const Icon = isSell ? TrendingDown : TrendingUp;
  const signedAmount = isSell ? transaction.net_amount : -transaction.net_amount;

  return (
    <>
      <EditFundTransactionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        accounts={accounts}
        funds={funds}
        transaction={transaction}
      />
      <DeleteFundTransactionDialog
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
              {transactionTypeLabel[transaction.transaction_type ?? ""] ??
                (isSell ? "賣出" : "買進")}
            </span>
            <Badge variant="outline">{formatTransactionDate(transaction.trade_date)}</Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground dark:text-zinc-500">
            {getAccountLabel(accounts, transaction)}
          </p>
          <p className="text-xs text-muted-foreground dark:text-zinc-500">
            {transaction.quantity.toLocaleString("zh-TW")} 單位 · 淨值{" "}
            {formatPrice(transaction.unit_price, transaction.currency)}
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
                aria-label={`${formatTransactionDate(transaction.trade_date)} 基金交易操作`}
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

function DeleteFundTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: FundTransaction;
}) {
  const [state, formAction, isPending] = useActionState(deleteFundTransaction, deleteInitialState);

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
            <AlertDialogTitle>刪除這筆基金交易？</AlertDialogTitle>
            <AlertDialogDescription>
              這會刪除此筆基金交易與對應的資金異動紀錄。此動作無法復原。
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
