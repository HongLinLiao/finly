"use client";

import { TrendingUp } from "lucide-react";
import React, { useMemo, useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";

import { Separator } from "../ui/separator";

import type { BoardLotType, BrokerageAccount, StockTransaction, TradeSide } from "@/types";

interface AddStockTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: BrokerageAccount[];
}

type FormState = {
  accountId: string;
  symbol: string;
  market: string;
  boardLotType: BoardLotType;
  side: TradeSide;
  tradeDate: string;
  settleDate: string;
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
  symbol: "",
  market: "",
  boardLotType: "regular",
  side: "buy",
  tradeDate: "",
  settleDate: "",
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
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-1 text-red-500">
      *
    </span>
  );
}

export function AddStockTransactionDialog({
  open,
  onOpenChange,
  accounts,
}: AddStockTransactionDialogProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const accountOptions = useMemo(() => {
    return accounts.map(account => ({
      id: account.id,
      name: account.accountName ?? account.brokerName,
    }));
  }, [accounts]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const quantity = toNumber(form.quantity);
    const unitPrice = toNumber(form.unitPrice);
    const grossAmount = form.grossAmount ? toNumber(form.grossAmount) : quantity * unitPrice;
    const fee = form.fee ? toNumber(form.fee) : 0;
    const tax = form.tax ? toNumber(form.tax) : 0;
    const netAmount = form.netAmount ? toNumber(form.netAmount) : grossAmount + fee + tax;
    if (!form.accountId) {
      return;
    }

    const payload: StockTransaction = {
      id: crypto.randomUUID(),
      assetType: "stock",
      accountId: form.accountId,
      symbol: form.symbol.trim().toUpperCase(),
      market: form.market.trim() || undefined,
      boardLotType: form.boardLotType,
      side: form.side,
      tradeDate: toUnixTimestamp(form.tradeDate),
      settleDate: form.settleDate ? toUnixTimestamp(form.settleDate) : undefined,
      quantity,
      unitPrice,
      grossAmount,
      fee: form.fee ? fee : undefined,
      tax: form.tax ? tax : undefined,
      netAmount,
      currency: form.currency,
      note: form.note.trim() || undefined,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    };

    console.info("新增股票交易明細（StockTransaction）", payload);
    handleDialogOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-2 pb-1">
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            新增股票交易明細
          </DialogTitle>
          {/* <DialogDescription>先填完必填欄位，其他金額欄位可稍後補齊。</DialogDescription> */}
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                券商帳戶（accountId）
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
                股票代號（symbol）
                <RequiredMark />
              </span>
              <Input
                required
                value={form.symbol}
                onChange={event => updateField("symbol", event.target.value)}
                placeholder="例如 2330 或 AAPL"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                交易方向（side）
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
              <span className="text-muted-foreground dark:text-zinc-100">交易市場（market）</span>
              <Input
                value={form.market}
                onChange={event => updateField("market", event.target.value)}
                placeholder="例如 TWSE / NASDAQ"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                交易單位（boardLotType）
              </span>
              <Select
                value={form.boardLotType}
                onValueChange={value => updateField("boardLotType", value as BoardLotType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">整股</SelectItem>
                  <SelectItem value="odd">零股</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">幣別（currency）</span>
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
                交易日期（tradeDate）
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
                交割日期（settleDate）
              </span>
              <Input
                type="date"
                value={form.settleDate}
                onChange={event => updateField("settleDate", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                數量（quantity）
                <RequiredMark />
              </span>
              <Input
                required
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={event => updateField("quantity", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                單價（unitPrice）
                <RequiredMark />
              </span>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={event => updateField("unitPrice", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                原始成交金額（grossAmount）
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.grossAmount}
                onChange={event => updateField("grossAmount", event.target.value)}
                placeholder="不填會自動用數量 x 單價"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                實際入帳/扣款（netAmount）
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.netAmount}
                onChange={event => updateField("netAmount", event.target.value)}
                placeholder="不填會自動計算"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">手續費（fee）</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.fee}
                onChange={event => updateField("fee", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">稅額（tax）</span>
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
            <span className="text-muted-foreground dark:text-zinc-100">備註（note）</span>
            <Textarea
              value={form.note}
              onChange={event => updateField("note", event.target.value)}
              placeholder="可記錄交易策略、事件或備註"
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
