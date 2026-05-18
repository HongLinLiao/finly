"use client";

import { Check, ChevronsUpDown, HandCoins } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RequiredMark } from "@/components/util/form/required-mark";
import { cn } from "@/lib/utils";
import {
  createFundTransaction,
  type CreateFundTransactionState,
} from "@/services/fund/createFundTransaction";
import { DIVIDEND_MODE_OPTIONS } from "@/types/fund";

import { Separator } from "../ui/separator";

import type { TaiwanFundOption } from "@/lib/cnyes-fund";
import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type { FundTransactionType, TradeSide } from "@/types";

interface AddFundTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: BrokerageAccountWithCashAccounts[];
  funds: TaiwanFundOption[];
}

const initialState: CreateFundTransactionState = {
  success: false,
  message: "",
};

function toDateInputValue(value: string) {
  if (!/^\d{8}$/.test(value)) return "";

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function FundOptionContent({ fund }: { fund: TaiwanFundOption }) {
  return (
    <>
      <span className="min-w-16 font-medium text-foreground">{fund.fundCode}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-foreground">{fund.fundName}</span>
        <span className="truncate text-xs font-normal text-muted-foreground">
          {fund.companyName} · {fund.currency}
        </span>
      </span>
    </>
  );
}

function AddFundTransactionForm({
  accounts,
  funds,
  onSuccess,
}: {
  accounts: BrokerageAccountWithCashAccounts[];
  funds: TaiwanFundOption[];
  onSuccess: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createFundTransaction, initialState);
  const [selectedCashAccountId, setSelectedCashAccountId] = useState("");
  const [selectedFundCode, setSelectedFundCode] = useState("");
  const [isFundSearchOpen, setIsFundSearchOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<FundTransactionType>("subscribe");
  const hasFunds = funds.length > 0;
  const selectedFund = funds.find(fund => fund.fundCode === selectedFundCode);

  const cashAccountOptions = useMemo(
    () =>
      accounts.flatMap(account =>
        account.securities_cash_accounts.map(cashAccount => ({
          id: cashAccount.id,
          brokerageAccountId: account.id,
          brokerageName: account.account_name,
          cashAccountName: cashAccount.account_name || cashAccount.currency,
          currency: cashAccount.currency,
        }))
      ),
    [accounts]
  );

  const selectedCashAccount = cashAccountOptions.find(item => item.id === selectedCashAccountId);
  const side: TradeSide =
    transactionType === "redeem" || transactionType === "switch-out" ? "sell" : "buy";
  const hasSettlementCurrencyMismatch =
    !!selectedCashAccount &&
    !!selectedFund &&
    selectedCashAccount.currency !== selectedFund.currency;

  useEffect(() => {
    if (!state.success) return;

    formRef.current?.reset();
    onSuccess();
  }, [onSuccess, state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="accountId" value={selectedCashAccount?.brokerageAccountId ?? ""} />
      <input type="hidden" name="cashAccountId" value={selectedCashAccount?.id ?? ""} />
      <input type="hidden" name="fundCode" value={selectedFund?.fundCode ?? ""} />
      <input type="hidden" name="side" value={side} />
      <input
        type="hidden"
        name="currency"
        value={selectedFund?.currency ?? selectedCashAccount?.currency ?? "TWD"}
      />

      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm sm:col-span-2">
          <span className="text-muted-foreground dark:text-zinc-100">
            基金
            <RequiredMark />
          </span>
          <Popover open={isFundSearchOpen} onOpenChange={setIsFundSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                role="combobox"
                aria-expanded={isFundSearchOpen}
                disabled={!hasFunds}
                className="h-auto min-h-9 w-full justify-between gap-3 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-left font-normal hover:bg-input/50 hover:text-foreground aria-expanded:bg-input/50 aria-expanded:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 dark:border-white/10 dark:bg-zinc-900/85 dark:hover:bg-zinc-900/85 dark:aria-expanded:bg-zinc-900/85"
              >
                {selectedFund ? (
                  <span className="flex min-w-0 flex-1 items-start gap-2">
                    <FundOptionContent fund={selectedFund} />
                  </span>
                ) : (
                  <span className="text-muted-foreground dark:text-zinc-400">
                    {hasFunds ? "搜尋基金名稱或代碼" : "基金資料暫時無法載入"}
                  </span>
                )}
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-(--radix-popover-trigger-width) gap-0 overflow-hidden rounded-lg p-0"
              onTouchMoveCapture={event => event.stopPropagation()}
              onWheelCapture={event => event.stopPropagation()}
            >
              <Command
                filter={(value, search, keywords) => {
                  const haystack = [value, ...(keywords ?? [])].join(" ").toLowerCase();
                  const keywordsToMatch = search
                    .trim()
                    .toLowerCase()
                    .split(/[\s,，]+/);

                  return keywordsToMatch.every(keyword => haystack.includes(keyword)) ? 1 : 0;
                }}
              >
                <CommandInput placeholder="搜尋基金名稱、代碼或投信" />
                <CommandList className="max-h-72 overscroll-contain">
                  <CommandEmpty>找不到基金</CommandEmpty>
                  <CommandGroup>
                    {funds.map(fund => (
                      <CommandItem
                        key={fund.fundCode}
                        value={fund.fundCode}
                        keywords={[fund.fundName, fund.companyName, fund.currency]}
                        onSelect={() => {
                          setSelectedFundCode(fund.fundCode);
                          setIsFundSearchOpen(false);
                        }}
                        className="items-start [&>svg:last-child]:hidden"
                      >
                        <FundOptionContent fund={fund} />
                        <Check
                          className={cn(
                            "ml-auto size-4 shrink-0",
                            selectedFundCode === fund.fundCode ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {!hasFunds ? (
            <p className="text-xs text-muted-foreground dark:text-zinc-500">
              基金資料來源暫時無法連線，稍後重新整理後可再試一次。
            </p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm sm:col-span-2">
          <span className="text-muted-foreground dark:text-zinc-100">
            資金戶
            <RequiredMark />
          </span>
          <Select value={selectedCashAccountId} onValueChange={setSelectedCashAccountId} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="選擇資金戶" />
            </SelectTrigger>
            <SelectContent>
              {cashAccountOptions.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  <span className="font-medium">{account.cashAccountName}</span>
                  <span className="text-muted-foreground">
                    {account.brokerageName} · {account.currency}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            交易日期
            <RequiredMark />
          </span>
          <Input name="tradeDate" required type="date" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">淨值日</span>
          <Input
            name="navDate"
            type="date"
            defaultValue={toDateInputValue(selectedFund?.latestNavDate ?? "")}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">交易類型</span>
          <Select
            name="transactionType"
            value={transactionType}
            onValueChange={value => setTransactionType(value as FundTransactionType)}
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
          <Select name="dividendMode" defaultValue="accumulation">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>不領現金</SelectLabel>
                <SelectItem value="accumulation">
                  {DIVIDEND_MODE_OPTIONS.find(option => option.value === "accumulation")?.label}
                </SelectItem>
                <SelectItem value="reinvest">
                  {DIVIDEND_MODE_OPTIONS.find(option => option.value === "reinvest")?.label}
                </SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>現金配息</SelectLabel>
                {DIVIDEND_MODE_OPTIONS.filter(option => option.value.startsWith("cash")).map(
                  option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            單位數
            <RequiredMark />
          </span>
          <Input name="quantity" required type="number" min="0.000001" step="0.000001" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            單位淨值
            <RequiredMark />
          </span>
          <Input
            key={selectedFund?.fundCode ?? "unit-price"}
            name="unitPrice"
            required
            type="number"
            min="0"
            step="0.000001"
            defaultValue={selectedFund?.latestNav ?? ""}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            原始成交金額（{selectedFund?.currency ?? "基金幣別"}）
          </span>
          <Input
            name="grossAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="不填會自動用單位數 x 單位淨值"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            交易淨額（{selectedFund?.currency ?? "基金幣別"}）
          </span>
          <Input
            name="netAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="不填會依交易方向自動計算"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            資金戶實際入帳/扣款
            {hasSettlementCurrencyMismatch ? <RequiredMark /> : null}
          </span>
          <Input
            name="cashSettlementAmount"
            type="number"
            min="0"
            step="0.01"
            required={hasSettlementCurrencyMismatch}
            placeholder={
              selectedCashAccount
                ? `${selectedCashAccount.currency} 金額；同幣別不填會沿用交易淨額`
                : "選擇資金戶後顯示幣別"
            }
          />
          {hasSettlementCurrencyMismatch ? (
            <p className="text-xs leading-relaxed text-muted-foreground dark:text-zinc-500">
              基金以 {selectedFund?.currency} 交易，資金戶以 {selectedCashAccount?.currency}{" "}
              入扣帳，請填實際扣款或入帳金額。
            </p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">手續費</span>
          <Input name="fee" type="number" min="0" step="0.01" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">稅額</span>
          <Input name="tax" type="number" min="0" step="0.01" />
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="text-muted-foreground dark:text-zinc-100">備註</span>
        <Textarea name="note" placeholder="可記錄申購批次、轉換原因或備註" />
      </label>

      {state.message && !state.success ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <Separator className="mt-10 mb-5" />

      <DialogFooter>
        <Button type="button" variant="outline" disabled={isPending} onClick={onSuccess}>
          取消
        </Button>
        <Button type="submit" disabled={isPending || !selectedCashAccount || !selectedFund}>
          {isPending ? "新增中" : "新增"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddFundTransactionDialog({
  open,
  onOpenChange,
  accounts,
  funds,
}: AddFundTransactionDialogProps) {
  const [formKey, setFormKey] = useState(0);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setFormKey(key => key + 1);
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-2 pb-1">
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="size-4 text-primary" />
            新增基金交易明細
          </DialogTitle>
        </DialogHeader>

        <AddFundTransactionForm
          key={formKey}
          accounts={accounts}
          funds={funds}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
