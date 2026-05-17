"use client";

import { HandCoins } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import type {
  BrokerageAccount,
  DividendMode,
  FundTransaction,
  FundTransactionType,
  TradeSide,
} from "@/types";
import type { FormEvent } from "react";

interface AddFundTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: BrokerageAccount[];
}

type FormState = {
  accountId: string;
  fundCode: string;
  side: TradeSide;
  tradeDate: string;
  settleDate: string;
  navDate: string;
  transactionType: FundTransactionType;
  dividendMode: DividendMode;
  quantity: string;
  unitPrice: string;
  grossAmount: string;
  fee: string;
  tax: string;
  netAmount: string;
  currency: string;
  note: string;
};

const DEFAULT_FORM: FormState = {
  accountId: "",
  fundCode: "",
  side: "buy",
  tradeDate: "",
  settleDate: "",
  navDate: "",
  transactionType: "subscribe",
  dividendMode: "reinvest",
  quantity: "",
  unitPrice: "",
  grossAmount: "",
  fee: "",
  tax: "",
  netAmount: "",
  currency: "TWD",
  note: "",
};

function toUnixTimestamp(dateString: string) {
  return Math.floor(new Date(`${dateString}T00:00:00`).getTime() / 1000);
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateNetAmount(side: TradeSide, grossAmount: number, fee: number, tax: number) {
  return side === "sell" ? grossAmount - fee - tax : grossAmount + fee + tax;
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-1 text-red-500">
      *
    </span>
  );
}

export function AddFundTransactionDialog({
  open,
  onOpenChange,
  accounts,
}: AddFundTransactionDialogProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const accountOptions = useMemo(() => {
    return accounts.map(account => ({
      id: account.id,
      name: account.account_name ?? account.broker_name,
    }));
  }, [accounts]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function updateTransactionType(value: FundTransactionType) {
    const side: TradeSide = value === "redeem" || value === "switch-out" ? "sell" : "buy";
    setForm(prev => ({ ...prev, transactionType: value, side }));
  }

  function resetForm() {
    setForm(DEFAULT_FORM);
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const quantity = toNumber(form.quantity);
    const unitPrice = toNumber(form.unitPrice);
    const grossAmount = form.grossAmount ? toNumber(form.grossAmount) : quantity * unitPrice;
    const fee = form.fee ? toNumber(form.fee) : 0;
    const tax = form.tax ? toNumber(form.tax) : 0;
    const netAmount = form.netAmount
      ? toNumber(form.netAmount)
      : calculateNetAmount(form.side, grossAmount, fee, tax);

    if (!form.accountId) {
      return;
    }

    const selectedAccount = accounts.find(account => account.id === form.accountId);
    if (!selectedAccount) {
      return;
    }

    const payload: FundTransaction = {
      id: crypto.randomUUID(),
      user_uid: selectedAccount.user_uid,
      account_id: form.accountId,
      trade_date: toUnixTimestamp(form.tradeDate),
      settle_date: form.settleDate ? toUnixTimestamp(form.settleDate) : undefined,
      side: form.side,
      fund_code: form.fundCode.trim().toUpperCase(),
      nav_date: form.navDate ? toUnixTimestamp(form.navDate) : undefined,
      transaction_type: form.transactionType,
      dividend_mode: form.dividendMode,
      quantity,
      unit_price: unitPrice,
      gross_amount: grossAmount,
      fee: form.fee ? fee : undefined,
      tax: form.tax ? tax : undefined,
      net_amount: netAmount,
      currency: form.currency,
      note: form.note.trim() || undefined,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };

    console.info("新增基金交易明細（FundTransaction）", payload);
    handleDialogOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-2 pb-1">
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="size-4 text-primary" />
            新增基金交易明細
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                券商帳戶
                <RequiredMark />
              </span>
              <Select
                value={form.accountId}
                onValueChange={value => updateField("accountId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇券商帳戶" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                基金代碼
                <RequiredMark />
              </span>
              <Input
                required
                value={form.fundCode}
                onChange={event => updateField("fundCode", event.target.value)}
                placeholder="例如 ALTW-A 或 MFG-001"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                交易日期
                <RequiredMark />
              </span>
              <Input
                required
                type="date"
                value={form.tradeDate}
                onChange={event => updateField("tradeDate", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                交易方向
                <RequiredMark />
              </span>
              <Select
                value={form.side}
                onValueChange={value => updateField("side", value as TradeSide)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">買進</SelectItem>
                  <SelectItem value="sell">賣出</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">淨值日</span>
              <Input
                type="date"
                value={form.navDate}
                onChange={event => updateField("navDate", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">交割日期</span>
              <Input
                type="date"
                value={form.settleDate}
                onChange={event => updateField("settleDate", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">交易類型</span>
              <Select
                value={form.transactionType}
                onValueChange={value => updateTransactionType(value as FundTransactionType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscribe">申購</SelectItem>
                  <SelectItem value="redeem">贖回</SelectItem>
                  <SelectItem value="switch-in">轉入</SelectItem>
                  <SelectItem value="switch-out">轉出</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">配息方式</span>
              <Select
                value={form.dividendMode}
                onValueChange={value => updateField("dividendMode", value as DividendMode)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">現金配息</SelectItem>
                  <SelectItem value="reinvest">配息再投入</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">幣別</span>
              <Select value={form.currency} onValueChange={value => updateField("currency", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TWD">TWD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                單位數
                <RequiredMark />
              </span>
              <Input
                required
                type="number"
                min="0.000001"
                step="0.000001"
                value={form.quantity}
                onChange={event => updateField("quantity", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                單位淨值
                <RequiredMark />
              </span>
              <Input
                required
                type="number"
                min="0"
                step="0.000001"
                value={form.unitPrice}
                onChange={event => updateField("unitPrice", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">原始成交金額</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.grossAmount}
                onChange={event => updateField("grossAmount", event.target.value)}
                placeholder="不填會自動用單位數 x 單位淨值"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">實際入帳/扣款</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.netAmount}
                onChange={event => updateField("netAmount", event.target.value)}
                placeholder="不填會依交易方向自動計算"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">手續費</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.fee}
                onChange={event => updateField("fee", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">稅額</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.tax}
                onChange={event => updateField("tax", event.target.value)}
              />
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground dark:text-zinc-100">備註</span>
            <Textarea
              value={form.note}
              onChange={event => updateField("note", event.target.value)}
              placeholder="可記錄申購批次、轉換原因或備註"
            />
          </label>

          <Separator className="mt-10 mb-5" />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleDialogOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">新增</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
