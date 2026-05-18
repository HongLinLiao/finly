"use client";

import { Check, ChevronsUpDown, TrendingUp } from "lucide-react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createStockTransaction,
  type CreateStockTransactionState,
} from "@/services/stock/createStockTransaction";

import { Separator } from "../ui/separator";
import { RequiredMark } from "../util/form/required-mark";

import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type { TradeSide } from "@/types";
import type { StockOption } from "@/types/stock-option";

interface AddStockTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: BrokerageAccountWithCashAccounts[];
}

const initialState: CreateStockTransactionState = {
  success: false,
  message: "",
};

function StockOptionContent({ stock }: { stock: StockOption }) {
  return (
    <>
      <span className="min-w-18 font-medium text-foreground">{stock.symbol}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-foreground">{stock.name}</span>
        <span className="truncate text-xs font-normal text-muted-foreground">
          {stock.exchangeName || stock.market} · {stock.currency}
        </span>
      </span>
    </>
  );
}

export function AddStockTransactionDialog({
  open,
  onOpenChange,
  accounts,
}: AddStockTransactionDialogProps) {
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
            <TrendingUp className="size-4 text-primary" />
            新增股票交易明細
          </DialogTitle>
        </DialogHeader>

        <AddStockTransactionForm
          key={formKey}
          accounts={accounts}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddStockTransactionForm({
  accounts,
  onSuccess,
}: {
  accounts: BrokerageAccountWithCashAccounts[];
  onSuccess: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createStockTransaction, initialState);
  const [selectedCashAccountId, setSelectedCashAccountId] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [stockSearch, setStockSearch] = useState("");
  const [stockSearchResults, setStockSearchResults] = useState<StockOption[]>([]);
  const [isStockSearching, setIsStockSearching] = useState(false);
  const [stockSearchError, setStockSearchError] = useState("");
  const [isStockSearchOpen, setIsStockSearchOpen] = useState(false);
  const [side, setSide] = useState<TradeSide>("buy");

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
  const hasCashAccounts = cashAccountOptions.length > 0;
  const hasSettlementCurrencyMismatch =
    !!selectedCashAccount &&
    !!selectedStock &&
    selectedCashAccount.currency !== selectedStock.currency;
  useEffect(() => {
    if (!state.success) return;

    formRef.current?.reset();
    onSuccess();
  }, [onSuccess, state.success]);

  useEffect(() => {
    const query = stockSearch.trim();

    if (!isStockSearchOpen || !query) {
      setStockSearchResults([]);
      setIsStockSearching(false);
      setStockSearchError("");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsStockSearching(true);
      setStockSearchError("");

      try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Stock search request failed.");
        }

        const data = (await response.json()) as { stocks?: StockOption[] };

        setStockSearchResults(Array.isArray(data.stocks) ? data.stocks : []);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Failed to search stocks:", error);
        setStockSearchResults([]);
        setStockSearchError("股票搜尋暫時無法使用，請稍後再試。");
      } finally {
        if (!controller.signal.aborted) {
          setIsStockSearching(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isStockSearchOpen, stockSearch]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="accountId" value={selectedCashAccount?.brokerageAccountId ?? ""} />
      <input type="hidden" name="cashAccountId" value={selectedCashAccount?.id ?? ""} />
      <input type="hidden" name="symbol" value={selectedStock?.symbol ?? ""} />
      <input type="hidden" name="market" value={selectedStock?.market ?? ""} />
      <input type="hidden" name="yahooSymbol" value={selectedStock?.yahooSymbol ?? ""} />
      <input type="hidden" name="side" value={side} />
      <input type="hidden" name="currency" value={selectedStock?.currency ?? ""} />

      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm sm:col-span-2">
          <span className="text-muted-foreground dark:text-zinc-100">
            資金戶
            <RequiredMark />
          </span>
          <Select
            value={selectedCashAccountId}
            onValueChange={setSelectedCashAccountId}
            disabled={!hasCashAccounts}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={hasCashAccounts ? "選擇資金戶" : "尚未建立資金戶"} />
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

        <label className="space-y-2 text-sm sm:col-span-2">
          <span className="text-muted-foreground dark:text-zinc-100">
            股票標的
            <RequiredMark />
          </span>
          <Popover open={isStockSearchOpen} onOpenChange={setIsStockSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                role="combobox"
                aria-expanded={isStockSearchOpen}
                className="h-auto min-h-9 w-full justify-between gap-3 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-left font-normal hover:bg-input/50 hover:text-foreground aria-expanded:bg-input/50 aria-expanded:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 dark:border-white/10 dark:bg-zinc-900/85 dark:hover:bg-zinc-900/85 dark:aria-expanded:bg-zinc-900/85"
              >
                {selectedStock ? (
                  <span className="flex min-w-0 flex-1 items-start gap-2">
                    <StockOptionContent stock={selectedStock} />
                  </span>
                ) : (
                  <span className="text-muted-foreground dark:text-zinc-400">
                    搜尋股票代號或名稱
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
              <Command shouldFilter={false}>
                <CommandInput
                  value={stockSearch}
                  onValueChange={setStockSearch}
                  placeholder="輸入 2330.TW、AAPL、7203.T 或 0700.HK"
                />
                <CommandList className="max-h-72 overscroll-contain">
                  <CommandEmpty>
                    {!stockSearch.trim()
                      ? "輸入股票代號或名稱搜尋全球股票與 ETF"
                      : isStockSearching
                        ? "搜尋中"
                        : stockSearchError || "找不到股票，請換代號或名稱搜尋"}
                  </CommandEmpty>
                  <CommandGroup>
                    {stockSearchResults.map(stock => (
                      <CommandItem
                        key={stock.yahooSymbol}
                        value={stock.yahooSymbol}
                        keywords={[
                          stock.symbol,
                          stock.name,
                          stock.market,
                          stock.currency,
                          stock.exchangeName,
                        ]}
                        onSelect={() => {
                          setSelectedStock(stock);
                          setStockSearch("");
                          setIsStockSearchOpen(false);
                        }}
                        className="items-start [&>svg:last-child]:hidden"
                      >
                        <StockOptionContent stock={stock} />
                        <Check
                          className={cn(
                            "ml-auto size-4 shrink-0",
                            selectedStock?.yahooSymbol === stock.yahooSymbol
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            交易方向
            <RequiredMark />
          </span>
          <Select value={side} onValueChange={value => setSide(value as TradeSide)}>
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
          <span className="text-muted-foreground dark:text-zinc-100">
            交易日期
            <RequiredMark />
          </span>
          <Input name="tradeDate" required type="date" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            數量（股）
            <RequiredMark />
          </span>
          <Input
            name="quantity"
            required
            type="number"
            min="0.000001"
            step="0.000001"
            placeholder="例如 1000、233、1.5"
          />
          <p className="text-xs leading-relaxed text-muted-foreground dark:text-zinc-500">
            請輸入實際股數。台股 1 張請填 1000，零股 10 股請填 10；海外股票請填實際成交股數。
          </p>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            單價
            <RequiredMark />
          </span>
          <Input name="unitPrice" required type="number" min="0" step="0.000001" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            原始成交金額（{selectedStock?.currency ?? "標的幣別"}）
          </span>
          <Input
            name="grossAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="不填會自動用數量 x 單價"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">手續費</span>
          <Input name="fee" type="number" min="0" step="0.01" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">稅額</span>
          <Input name="tax" type="number" min="0" step="0.01" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-100">
            交易淨額（{selectedStock?.currency ?? "標的幣別"}）
          </span>
          <Input name="netAmount" type="number" min="0" step="0.01" placeholder="不填會自動計算" />
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
              股票以 {selectedStock?.currency} 成交，資金戶以 {selectedCashAccount?.currency}{" "}
              入扣帳，請填券商實際扣款或入帳金額。
            </p>
          ) : null}
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="text-muted-foreground dark:text-zinc-100">備註</span>
        <Textarea name="note" placeholder="可記錄交易策略、事件或備註" />
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
        <Button type="submit" disabled={isPending || !selectedCashAccountId || !selectedStock}>
          {isPending ? "新增中" : "新增"}
        </Button>
      </DialogFooter>
    </form>
  );
}
