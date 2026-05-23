"use client";

import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  HandCoins,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";

import { AddFundTransactionDialog } from "@/components/fund/add-fund-transaction-dialog";
import { EditFundTransactionDialog } from "@/components/fund/edit-fund-transaction-dialog";
import { AddStockTransactionDialog } from "@/components/stock/add-stock-transaction-dialog";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RequiredMark } from "@/components/util/form/required-mark";
import { cn } from "@/lib/utils";
import {
  createCashAccountMovement,
  type CashAccountMovementFormState,
} from "@/services/cash-account/createCashAccountMovement";
import {
  deleteCashAccountMovement,
  type DeleteCashAccountMovementState,
} from "@/services/cash-account/deleteCashAccountMovement";
import {
  updateCashAccountMovement,
  type UpdateCashAccountMovementState,
} from "@/services/cash-account/updateCashAccountMovement";

import type { TaiwanFundOption } from "@/lib/cnyes-fund";
import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type {
  CashAccountMovement,
  CashMovementMethod,
  FundTransaction,
  StockTransaction,
} from "@/types";

interface CashMovementRecordsClientProps {
  accounts: BrokerageAccountWithCashAccounts[];
  fundTransactions: FundTransaction[];
  funds: TaiwanFundOption[];
  month: number;
  movements: CashAccountMovement[];
  stockTransactions: StockTransaction[];
  year: number;
}

type CashAccountOption = {
  id: string;
  brokerageAccountId: string;
  brokerageName: string;
  name: string;
  currency: string;
};

const movementInitialState: CashAccountMovementFormState = {
  success: false,
  message: "",
};

const updateInitialState: UpdateCashAccountMovementState = {
  success: false,
  message: "",
};

const deleteInitialState: DeleteCashAccountMovementState = {
  success: false,
  message: "",
};

const methodOptions: { value: CashMovementMethod; label: string }[] = [
  { value: "transfer-in", label: "轉入" },
  { value: "transfer-out", label: "轉出" },
  { value: "stock-buy-settlement", label: "股票買進交割" },
  { value: "stock-sell-settlement", label: "股票賣出交割" },
  { value: "fund-subscribe-settlement", label: "基金申購扣款" },
  { value: "fund-redeem-settlement", label: "基金贖回入帳" },
  { value: "fund-switch-in-settlement", label: "基金轉入扣款" },
  { value: "fund-switch-out-settlement", label: "基金轉出入帳" },
  { value: "fee", label: "手續費" },
  { value: "tax", label: "稅款" },
  { value: "dividend", label: "配息" },
  { value: "interest", label: "利息" },
  { value: "fx-exchange", label: "匯兌" },
];

const methodLabel = Object.fromEntries(methodOptions.map(option => [option.value, option.label]));

const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"];
const monthLabels = Array.from({ length: 12 }, (_, index) => `${index + 1}月`);

function toDateKey(timestamp: number) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp * 1000));
}

function toTimeValue(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp * 1000));
}

function formatDayLabel(dateKey: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(`${dateKey}T00:00:00+08:00`));
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function formatAmount(value: number, currency: string) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leading = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((leading + lastDay.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(year, month, index - leading + 1);

    return {
      date,
      key: toDateKey(date.getTime() / 1000),
      inMonth: date.getMonth() === month,
      day: date.getDate(),
    };
  });
}

function getTodayKey() {
  return toDateKey(Date.now() / 1000);
}

function getDateKeyForMonth(year: number, month: number, sourceDateKey: string) {
  const day = Number(sourceDateKey.slice(8, 10)) || 1;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const date = new Date(year, month, Math.min(day, lastDay));

  return toDateKey(date.getTime() / 1000);
}

function getInitialSelectedDateKey(year: number, month: number) {
  const todayKey = getTodayKey();
  const todayYear = Number(todayKey.slice(0, 4));
  const todayMonth = Number(todayKey.slice(5, 7));

  return todayYear === year && todayMonth === month
    ? todayKey
    : `${year}-${String(month).padStart(2, "0")}-01`;
}

function getAccountOptions(accounts: BrokerageAccountWithCashAccounts[]) {
  return accounts.flatMap(account =>
    account.securities_cash_accounts.map(cashAccount => ({
      id: cashAccount.id,
      brokerageAccountId: account.id,
      brokerageName: account.account_name,
      name: cashAccount.account_name || cashAccount.currency,
      currency: cashAccount.currency,
    }))
  );
}

export function CashMovementRecordsClient({
  accounts,
  fundTransactions,
  funds,
  month,
  movements,
  stockTransactions,
  year,
}: CashMovementRecordsClientProps) {
  const router = useRouter();
  const [monthDate, setMonthDate] = useState(() => new Date(year, month - 1, 1));
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    getInitialSelectedDateKey(year, month)
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);
  const accountOptions = useMemo(() => getAccountOptions(accounts), [accounts]);
  const stockTransactionMap = useMemo(
    () => new Map(stockTransactions.map(transaction => [transaction.id, transaction])),
    [stockTransactions]
  );
  const fundTransactionMap = useMemo(
    () => new Map(fundTransactions.map(transaction => [transaction.id, transaction])),
    [fundTransactions]
  );
  const monthDays = useMemo(() => buildMonthDays(monthDate), [monthDate]);
  const movementsByDate = useMemo(() => {
    const map = new Map<string, CashAccountMovement[]>();

    movements.forEach(movement => {
      const key = toDateKey(movement.occurred_at);
      const items = map.get(key) ?? [];
      items.push(movement);
      map.set(key, items);
    });

    map.forEach(items => items.sort((a, b) => b.occurred_at - a.occurred_at));

    return map;
  }, [movements]);
  const selectedMovements = movementsByDate.get(selectedDateKey) ?? [];
  const monthMovementCount = monthDays.reduce(
    (total, day) => total + (day.inMonth ? (movementsByDate.get(day.key)?.length ?? 0) : 0),
    0
  );

  function moveMonth(offset: number) {
    const next = new Date(monthDate.getFullYear(), monthDate.getMonth() + offset, 1);

    navigateToMonth(next.getFullYear(), next.getMonth());
  }

  function openMonthPicker(nextOpen: boolean) {
    if (nextOpen) {
      setPickerYear(monthDate.getFullYear());
    }

    setMonthPickerOpen(nextOpen);
  }

  function selectMonth(year: number, month: number) {
    navigateToMonth(year, month);
    setMonthPickerOpen(false);
  }

  function navigateToMonth(year: number, month: number) {
    const nextDateKey = getDateKeyForMonth(year, month, selectedDateKey);

    setMonthDate(new Date(year, month, 1));
    setSelectedDateKey(nextDateKey);
    router.replace(`/brokerages/records?year=${year}&month=${month + 1}`, { scroll: false });
  }

  function selectDate(dateKey: string) {
    setSelectedDateKey(dateKey);
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground dark:text-zinc-50">
            帳戶交易
          </h1>
          <p className="text-sm text-muted-foreground dark:text-zinc-500">
            以日期管理資金戶流水，包含轉入、轉出、交割、配息與費用。
          </p>
        </div>

        <CreateRecordMenu
          disabled={accountOptions.length === 0}
          onCashSelect={() => setCreateOpen(true)}
          onFundSelect={() => setFundDialogOpen(true)}
          onStockSelect={() => setStockDialogOpen(true)}
        />
      </header>

      <MovementDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        accountOptions={accountOptions}
        defaultDateKey={selectedDateKey}
      />
      <AddStockTransactionDialog
        open={stockDialogOpen}
        onOpenChange={setStockDialogOpen}
        accounts={accounts}
      />
      <AddFundTransactionDialog
        open={fundDialogOpen}
        onOpenChange={setFundDialogOpen}
        accounts={accounts}
        funds={funds}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon-sm" onClick={() => moveMonth(-1)}>
                <ArrowLeft className="size-4" />
              </Button>
              <Popover open={monthPickerOpen} onOpenChange={openMonthPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto min-w-40 flex-col gap-0 rounded-2xl px-4 py-2"
                  >
                    <span className="inline-flex items-center gap-1 text-base font-semibold text-foreground dark:text-zinc-50">
                      {formatMonthLabel(monthDate)}
                      <ChevronDown className="size-4 text-muted-foreground" />
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {monthMovementCount} 筆異動
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-72 gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setPickerYear(year => year - 1)}
                    >
                      <ArrowLeft className="size-4" />
                    </Button>
                    <p className="text-base font-semibold text-foreground dark:text-zinc-50">
                      {pickerYear}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setPickerYear(year => year + 1)}
                    >
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {monthLabels.map((label, index) => {
                      const active =
                        monthDate.getFullYear() === pickerYear && monthDate.getMonth() === index;

                      return (
                        <Button
                          key={label}
                          type="button"
                          variant={active ? "default" : "outline"}
                          size="sm"
                          className="rounded-2xl"
                          onClick={() => selectMonth(pickerYear, index)}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
              <Button type="button" variant="outline" size="icon-sm" onClick={() => moveMonth(1)}>
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const todayKey = getTodayKey();

                setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
                setSelectedDateKey(todayKey);
                router.replace(
                  `/brokerages/records?year=${today.getFullYear()}&month=${today.getMonth() + 1}`,
                  { scroll: false }
                );
              }}
            >
              <CalendarDays className="size-4" />
              今天
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {weekdayLabels.map(label => (
              <div key={label} className="py-2">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map(day => {
              const dayMovements = movementsByDate.get(day.key) ?? [];
              const isSelected = selectedDateKey === day.key;
              const isToday = getTodayKey() === day.key;
              const inCount = dayMovements.filter(item => item.direction === "in").length;
              const outCount = dayMovements.length - inCount;

              return (
                <button
                  key={day.key}
                  type="button"
                  className={cn(
                    "min-h-24 rounded-xl border p-2 text-left transition-colors hover:bg-muted/70",
                    isSelected && "border-primary bg-primary/10",
                    !isSelected && "border-border/70 bg-background/70",
                    !day.inMonth && "opacity-45"
                  )}
                  onClick={() => selectDate(day.key)}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday && "bg-primary text-primary-foreground"
                      )}
                    >
                      {day.day}
                    </span>
                    {dayMovements.length > 0 ? (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                        {dayMovements.length}
                      </Badge>
                    ) : null}
                  </div>

                  {dayMovements.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {inCount > 0 ? (
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
                          入 {inCount}
                        </span>
                      ) : null}
                      {outCount > 0 ? (
                        <span className="rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-600 dark:text-rose-300">
                          出 {outCount}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-foreground dark:text-zinc-50">
                {formatDayLabel(selectedDateKey)}
              </p>
              <p className="text-sm text-muted-foreground">{selectedMovements.length} 筆異動</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={accountOptions.length === 0}
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {selectedMovements.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              這一天沒有資金異動。
            </div>
          ) : (
            <div className="space-y-2">
              {selectedMovements.map(movement => (
                <MovementRow
                  key={movement.id}
                  movement={movement}
                  accountOptions={accountOptions}
                  accounts={accounts}
                  fundTransaction={
                    movement.fund_transaction_id
                      ? fundTransactionMap.get(movement.fund_transaction_id)
                      : undefined
                  }
                  funds={funds}
                  stockTransaction={
                    movement.stock_transaction_id
                      ? stockTransactionMap.get(movement.stock_transaction_id)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function CreateRecordMenu({
  disabled,
  onCashSelect,
  onFundSelect,
  onStockSelect,
}: {
  disabled: boolean;
  onCashSelect: () => void;
  onFundSelect: () => void;
  onStockSelect: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" disabled={disabled}>
          <Plus className="size-4" />
          新增紀錄
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={onCashSelect}>
          <CircleDollarSign className="size-4" />
          資金異動
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onStockSelect}>
          <TrendingUp className="size-4" />
          股票交易
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onFundSelect}>
          <HandCoins className="size-4" />
          基金交易
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MovementRow({
  movement,
  accountOptions,
  accounts,
  fundTransaction,
  funds,
  stockTransaction,
}: {
  movement: CashAccountMovement;
  accountOptions: CashAccountOption[];
  accounts: BrokerageAccountWithCashAccounts[];
  fundTransaction?: FundTransaction;
  funds: TaiwanFundOption[];
  stockTransaction?: StockTransaction;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const account = accountOptions.find(item => item.id === movement.cash_account_id);
  const isIn = movement.direction === "in";
  const Icon = isIn ? ArrowDownLeft : ArrowUpRight;
  const signedAmount = isIn ? movement.amount : -movement.amount;
  const linked = movement.stock_transaction_id || movement.fund_transaction_id;
  const editMode = stockTransaction ? "stock" : fundTransaction ? "fund" : "cash";

  return (
    <>
      {stockTransaction ? (
        <EditStockTransactionDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          accounts={accounts}
          transaction={stockTransaction}
        />
      ) : null}
      {fundTransaction ? (
        <EditFundTransactionDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          accounts={accounts}
          funds={funds}
          transaction={fundTransaction}
        />
      ) : null}
      {editMode === "cash" ? (
        <MovementDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          accountOptions={accountOptions}
          movement={movement}
        />
      ) : null}
      <DeleteMovementDialog open={deleteOpen} onOpenChange={setDeleteOpen} movement={movement} />

      <div className="flex items-start gap-3 rounded-2xl border bg-secondary/40 px-3 py-2.5 text-sm">
        <div
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
            isIn
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-300"
          )}
        >
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground dark:text-zinc-50">
              {methodLabel[movement.method] ?? movement.method}
            </span>
            {linked ? <Badge variant="outline">關聯交易</Badge> : null}
          </div>
          <p className="truncate text-xs text-muted-foreground dark:text-zinc-500">
            {toTimeValue(movement.occurred_at)} · {account?.brokerageName ?? "未知證券戶"} ·{" "}
            {account?.name ?? "未知資金戶"}
          </p>
          {movement.related_asset_code || movement.note ? (
            <p className="line-clamp-2 text-xs text-muted-foreground dark:text-zinc-500">
              {[movement.related_asset_code, movement.note].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-start gap-1">
          <p
            className={cn(
              "pt-1 text-right font-semibold",
              isIn ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"
            )}
          >
            {formatAmount(signedAmount, movement.currency)}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="資金異動操作">
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

function MovementDialog({
  open,
  onOpenChange,
  accountOptions,
  movement,
  defaultDateKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountOptions: CashAccountOption[];
  movement?: CashAccountMovement;
  defaultDateKey?: string;
}) {
  const isEditing = !!movement;
  const action = isEditing ? updateCashAccountMovement : createCashAccountMovement;
  const initialState = isEditing ? updateInitialState : movementInitialState;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const defaultAccount = movement
    ? accountOptions.find(item => item.id === movement.cash_account_id)
    : accountOptions[0];
  const [selectedCashAccountId, setSelectedCashAccountId] = useState(defaultAccount?.id ?? "");
  const selectedCashAccount = accountOptions.find(item => item.id === selectedCashAccountId);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;

    onOpenChange(false);
    router.refresh();
  }, [onOpenChange, router, state.success]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "編輯資金異動" : "新增資金異動"}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? "編輯單筆資金戶流水紀錄。" : "新增單筆資金戶流水紀錄。"}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          {movement ? <input type="hidden" name="id" value={movement.id} /> : null}
          <input
            type="hidden"
            name="brokerageAccountId"
            value={selectedCashAccount?.brokerageAccountId ?? ""}
          />
          <input type="hidden" name="currency" value={selectedCashAccount?.currency ?? ""} />

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm sm:col-span-2">
              <span className="text-muted-foreground dark:text-zinc-500">
                資金戶
                <RequiredMark />
              </span>
              <Select
                name="cashAccountId"
                value={selectedCashAccountId}
                onValueChange={setSelectedCashAccountId}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇資金戶" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      <span className="min-w-0 truncate font-medium">{option.name}</span>
                      <span className="min-w-0 truncate text-muted-foreground">
                        {option.brokerageName} · {option.currency}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-500">
                日期
                <RequiredMark />
              </span>
              <Input
                name="occurredDate"
                type="date"
                required
                defaultValue={movement ? toDateKey(movement.occurred_at) : defaultDateKey}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-500">時間</span>
              <Input
                name="occurredTime"
                type="time"
                defaultValue={movement ? toTimeValue(movement.occurred_at) : "09:00"}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-500">
                方向
                <RequiredMark />
              </span>
              <Select name="direction" defaultValue={movement?.direction ?? "in"} required>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">入帳</SelectItem>
                  <SelectItem value="out">出帳</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-500">
                異動方式
                <RequiredMark />
              </span>
              <Select name="method" defaultValue={movement?.method ?? "transfer-in"} required>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-500">
                金額
                <RequiredMark />
              </span>
              <Input
                name="amount"
                type="number"
                min="0.000001"
                step="0.000001"
                required
                defaultValue={movement?.amount ?? ""}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-500">幣別</span>
              <Input
                value={selectedCashAccount?.currency ?? ""}
                disabled
                className="border-border/60 bg-muted/70 text-muted-foreground disabled:opacity-70 dark:bg-zinc-900/60"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-500">異動後餘額</span>
              <Input
                name="balanceAfter"
                type="number"
                min="0"
                step="0.000001"
                defaultValue={movement?.balance_after ?? ""}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-500">關聯資產</span>
              <Select name="relatedAssetType" defaultValue={movement?.related_asset_type ?? "none"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">無</SelectItem>
                  <SelectItem value="stock">股票</SelectItem>
                  <SelectItem value="fund">基金</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm sm:col-span-2">
              <span className="text-muted-foreground dark:text-zinc-500">關聯代碼</span>
              <Input
                name="relatedAssetCode"
                defaultValue={movement?.related_asset_code ?? ""}
                placeholder="例如 2330.TW 或基金代碼"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground dark:text-zinc-500">備註</span>
            <Textarea name="note" defaultValue={movement?.note ?? ""} />
          </label>

          {movement?.stock_transaction_id || movement?.fund_transaction_id ? (
            <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
              這筆流水已連結股票或基金交易；直接編輯可能讓交易明細與資金流水不同步。
            </p>
          ) : null}

          {state.message && !state.success ? (
            <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isPending || !selectedCashAccount}>
              {isPending ? "儲存中" : "儲存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteMovementDialog({
  open,
  onOpenChange,
  movement,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: CashAccountMovement;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteCashAccountMovement,
    deleteInitialState
  );

  useEffect(() => {
    if (!state.success) return;

    onOpenChange(false);
  }, [onOpenChange, state.success]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="id" value={movement.id} />

          <AlertDialogHeader>
            <AlertDialogTitle>刪除這筆資金異動？</AlertDialogTitle>
            <AlertDialogDescription>
              這會刪除此筆資金戶流水。若它連結股票或基金交易，交易本身不會被刪除。
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
