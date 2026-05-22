"use client";

import {
  ChevronDown,
  CircleDollarSign,
  Landmark,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { EditBrokerageAccountDialog } from "@/components/brokerage/edit-brokerage-account-dialog";
import { EditCashAccountDialog } from "@/components/brokerage/edit-cash-account-dialog";
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
import { cn } from "@/lib/utils";
import {
  deleteBrokerageAccount,
  type DeleteBrokerageAccountState,
} from "@/services/brokerage/deleteBrokerageAccount";
import {
  deleteCashAccount,
  type DeleteCashAccountState,
} from "@/services/cash-account/deleteCashAccount";

import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type { AccountStatus, BrokerageAccount } from "@/types";
import type { ReactNode } from "react";

type CashAccount = BrokerageAccountWithCashAccounts["securities_cash_accounts"][number];

interface BrokerageAccountListProps {
  accounts: BrokerageAccountWithCashAccounts[];
}

const statusLabel: Record<AccountStatus, string> = {
  active: "啟用中",
  inactive: "暫停使用",
  closed: "已結清",
};

const statusClassName: Record<AccountStatus, string> = {
  active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  inactive: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  closed: "border-zinc-500/20 bg-zinc-500/10 text-muted-foreground",
};

function formatDate(value: BrokerageAccount["created_at"]) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "未知";

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatAccountNo(accountNo?: string) {
  return accountNo?.trim() || "未填寫戶號";
}

const deleteInitialState: DeleteBrokerageAccountState = {
  success: false,
  message: "",
};

const deleteCashInitialState: DeleteCashAccountState = {
  success: false,
  message: "",
};

export function BrokerageAccountList({ accounts }: BrokerageAccountListProps) {
  const [openedRows, setOpenedRows] = useState<Record<string, boolean>>({});

  return (
    <div className="grid gap-3">
      {accounts.map(account => (
        <BrokerageAccountCard
          key={account.id}
          account={account}
          open={!!openedRows[account.id]}
          onOpenChange={open => {
            setOpenedRows(prev => ({ ...prev, [account.id]: open }));
          }}
        />
      ))}
    </div>
  );
}

function BrokerageAccountCard({
  account,
  open,
  onOpenChange,
}: {
  account: BrokerageAccountWithCashAccounts;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <EditBrokerageAccountDialog account={account} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteBrokerageAccountDialog
        account={account}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      <Collapsible open={open} onOpenChange={onOpenChange}>
        <Card size="sm" className="rounded-2xl py-4 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="px-4">
            <div className="flex items-start gap-2">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="relative min-w-0 flex-1 cursor-pointer pr-7 text-left"
                  aria-label={`${account.account_name} 證券戶明細`}
                >
                  <ChevronDown
                    className={cn(
                      "absolute top-0.5 right-0 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      open && "rotate-180"
                    )}
                  />

                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Landmark className="size-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-base font-medium text-foreground dark:text-zinc-50">
                          {account.account_name}
                        </p>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground dark:text-zinc-500">
                          <span>{account.broker_name}</span>
                          <span aria-hidden>·</span>
                          <span>{formatAccountNo(account.account_no)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      {account.base_currency ? (
                        <Badge variant="outline">{account.base_currency}</Badge>
                      ) : null}
                      <Badge variant="outline" className={cn(statusClassName[account.status])}>
                        {statusLabel[account.status]}
                      </Badge>
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                    aria-label={`${account.account_name} 更多操作`}
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

            <CollapsibleContent className="pt-4">
              <Separator className="mb-4" />
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <DetailField label="建立日期" value={formatDate(account.created_at)} />
                <DetailField label="基準幣別" value={account.base_currency ?? "未設定"} />
                <DetailField
                  label="資金帳戶數"
                  value={`${account.securities_cash_accounts.length} 個`}
                />
              </div>

              {account.securities_cash_accounts.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                  {account.securities_cash_accounts.map(cashAccount => (
                    <CashAccountChip key={cashAccount.id} cashAccount={cashAccount} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
                  這個證券戶尚未建立資金帳戶。
                </div>
              )}
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>
    </>
  );
}

function CashAccountChip({ cashAccount }: { cashAccount: CashAccount }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const displayName = cashAccount.account_name || cashAccount.currency;

  return (
    <>
      <EditCashAccountDialog cashAccount={cashAccount} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteCashAccountDialog
        cashAccount={cashAccount}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      <div className="inline-flex min-h-10 items-center gap-2 rounded-xl border bg-secondary/50 py-1.5 pr-1.5 pl-3 text-sm">
        <CircleDollarSign className="size-4 text-muted-foreground" />
        <span className="font-medium text-foreground dark:text-zinc-50">{displayName}</span>
        {cashAccount.account_name ? (
          <span className="text-muted-foreground dark:text-zinc-500">{cashAccount.currency}</span>
        ) : null}
        <Badge variant="outline" className={cn("ml-1", statusClassName[cashAccount.status])}>
          {statusLabel[cashAccount.status]}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="ml-0.5"
              aria-label={`${displayName} 更多操作`}
            >
              <MoreVertical className="size-3" />
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
    </>
  );
}

function DeleteBrokerageAccountDialog({
  account,
  open,
  onOpenChange,
}: {
  account: BrokerageAccountWithCashAccounts;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(deleteBrokerageAccount, deleteInitialState);

  useEffect(() => {
    if (!state.success) return;

    onOpenChange(false);
  }, [onOpenChange, state.success]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="id" value={account.id} />

          <AlertDialogHeader>
            <AlertDialogTitle>刪除「{account.account_name}」？</AlertDialogTitle>
            <AlertDialogDescription>
              這會一併刪除此證券戶下的資金帳戶與相關交易紀錄。此動作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>

          {account.securities_cash_accounts.length > 0 ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              目前包含 {account.securities_cash_accounts.length} 個資金帳戶，刪除前請再次確認。
            </div>
          ) : null}

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

function DeleteCashAccountDialog({
  cashAccount,
  open,
  onOpenChange,
}: {
  cashAccount: CashAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(deleteCashAccount, deleteCashInitialState);
  const displayName = cashAccount.account_name || cashAccount.currency;

  useEffect(() => {
    if (!state.success) return;

    onOpenChange(false);
  }, [onOpenChange, state.success]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="id" value={cashAccount.id} />

          <AlertDialogHeader>
            <AlertDialogTitle>刪除「{displayName}」？</AlertDialogTitle>
            <AlertDialogDescription>
              這會刪除此資金戶與相關資金異動紀錄。此動作無法復原。
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

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-muted/60 px-3 py-2.5 dark:border-white/10 dark:bg-zinc-900/75">
      <p className="text-xs text-muted-foreground dark:text-zinc-500">{label}</p>
      <p className="mt-1 break-all text-sm text-foreground dark:text-zinc-100">{value}</p>
    </div>
  );
}
