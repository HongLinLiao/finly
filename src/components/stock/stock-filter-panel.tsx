import { Filter } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { formatCurrency } from "./stock-transaction-data";

import type { BrokerageAccount } from "@/types";

interface StockFilterPanelProps {
  accounts: BrokerageAccount[];
  symbols: string[];
  accountFilter: string;
  sideFilter: string;
  symbolFilter: string;
  onAccountFilterChange: (value: string) => void;
  onSideFilterChange: (value: string) => void;
  onSymbolFilterChange: (value: string) => void;
  count: number;
  buyCount: number;
  sellCount: number;
  totalNet: number;
  currency: string;
}

export function StockFilterPanel({
  accounts,
  symbols,
  accountFilter,
  sideFilter,
  symbolFilter,
  onAccountFilterChange,
  onSideFilterChange,
  onSymbolFilterChange,
  count,
  buyCount,
  sellCount,
  totalNet,
  currency,
}: StockFilterPanelProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="size-4 text-primary" />
          篩選條件
        </CardTitle>
        <CardDescription className="text-foreground dark:text-zinc-100">
          共 {count} 筆，買進 {buyCount} 筆，賣出 {sellCount} 筆
        </CardDescription>
        <p className="text-xs text-foreground dark:text-zinc-100">
          淨額 {formatCurrency(totalNet, currency)}
        </p>
      </CardHeader>

      <CardContent className="pt-1">
        <Separator />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground dark:text-zinc-500">證券帳戶</p>
            <Select value={accountFilter} onValueChange={onAccountFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選擇帳戶" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部帳戶</SelectItem>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.accountName ?? account.brokerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground dark:text-zinc-500">交易方向</p>
            <Select value={sideFilter} onValueChange={onSideFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選擇交易方向" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部方向</SelectItem>
                <SelectItem value="buy">買進</SelectItem>
                <SelectItem value="sell">賣出</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground dark:text-zinc-500">股票代號</p>
            <Select value={symbolFilter} onValueChange={onSymbolFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選擇股票代號" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部股票</SelectItem>
                {symbols.map(symbol => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
