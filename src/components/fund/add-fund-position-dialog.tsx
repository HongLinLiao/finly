"use client";

import { HandCoins } from "lucide-react";
import { useState } from "react";

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

import type { FundCurrency, FundRisk } from "./fund-list-data";
import type { DividendMode } from "@/types/fund";
import type { FormEvent } from "react";

interface AddFundPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormState = {
  name: string;
  symbol: string;
  fundHouse: string;
  risk: FundRisk;
  dividendMode: DividendMode;
  currency: FundCurrency;
  costAmount: string;
  marketValue: string;
  return1m: string;
  return1y: string;
  note: string;
};

const DEFAULT_FORM: FormState = {
  name: "",
  symbol: "",
  fundHouse: "",
  risk: "RR3",
  dividendMode: "reinvest",
  currency: "TWD",
  costAmount: "",
  marketValue: "",
  return1m: "",
  return1y: "",
  note: "",
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-1 text-red-500">
      *
    </span>
  );
}

export function AddFundPositionDialog({ open, onOpenChange }: AddFundPositionDialogProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      symbol: form.symbol.trim().toUpperCase(),
      fundHouse: form.fundHouse.trim(),
      risk: form.risk,
      dividendMode: form.dividendMode,
      currency: form.currency,
      costAmount: toNumber(form.costAmount),
      marketValue: toNumber(form.marketValue),
      return1m: toNumber(form.return1m),
      return1y: toNumber(form.return1y),
      note: form.note.trim() || undefined,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    };

    console.info("新增基金持倉", payload);
    handleDialogOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-2 pb-1">
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="size-4 text-primary" />
            新增基金持倉
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                基金名稱
                <RequiredMark />
              </span>
              <Input
                required
                value={form.name}
                onChange={event => updateField("name", event.target.value)}
                placeholder="例如 安聯台灣科技基金 A"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                基金代碼
                <RequiredMark />
              </span>
              <Input
                required
                value={form.symbol}
                onChange={event => updateField("symbol", event.target.value)}
                placeholder="例如 ALTW-A"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">
                基金公司
                <RequiredMark />
              </span>
              <Input
                required
                value={form.fundHouse}
                onChange={event => updateField("fundHouse", event.target.value)}
                placeholder="例如 安聯投信"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">風險等級</span>
              <Select
                value={form.risk}
                onValueChange={value => updateField("risk", value as FundRisk)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RR1">RR1</SelectItem>
                  <SelectItem value="RR2">RR2</SelectItem>
                  <SelectItem value="RR3">RR3</SelectItem>
                  <SelectItem value="RR4">RR4</SelectItem>
                  <SelectItem value="RR5">RR5</SelectItem>
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
              <Select
                value={form.currency}
                onValueChange={value => updateField("currency", value as FundCurrency)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TWD">TWD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">持有成本</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.costAmount}
                onChange={event => updateField("costAmount", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">目前市值</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.marketValue}
                onChange={event => updateField("marketValue", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">近一月報酬（%）</span>
              <Input
                type="number"
                step="0.1"
                value={form.return1m}
                onChange={event => updateField("return1m", event.target.value)}
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground dark:text-zinc-100">一年報酬（%）</span>
              <Input
                type="number"
                step="0.1"
                value={form.return1y}
                onChange={event => updateField("return1y", event.target.value)}
              />
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground dark:text-zinc-100">備註</span>
            <Textarea
              value={form.note}
              onChange={event => updateField("note", event.target.value)}
              placeholder="可記錄投資主題、再平衡策略或備註"
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
