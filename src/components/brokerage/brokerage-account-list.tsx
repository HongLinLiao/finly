"use client";

import { ChevronDown, CircleDollarSign, Landmark } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type { AccountStatus, BrokerageAccount } from "@/types";
import type { ReactNode } from "react";

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
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card size="sm" className="rounded-2xl py-4 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="px-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="relative w-full cursor-pointer pr-8 text-left"
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
                  <div
                    key={cashAccount.id}
                    className="inline-flex items-center gap-2 rounded-xl border bg-secondary/50 px-3 py-2 text-sm"
                  >
                    <CircleDollarSign className="size-4 text-muted-foreground" />
                    <span className="font-medium text-foreground dark:text-zinc-50">
                      {cashAccount.account_name || cashAccount.currency}
                    </span>
                    {cashAccount.account_name ? (
                      <span className="text-muted-foreground dark:text-zinc-500">
                        {cashAccount.currency}
                      </span>
                    ) : null}
                    <Badge
                      variant="outline"
                      className={cn("ml-1", statusClassName[cashAccount.status])}
                    >
                      {statusLabel[cashAccount.status]}
                    </Badge>
                  </div>
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
