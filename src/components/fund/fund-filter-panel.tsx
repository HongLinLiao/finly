import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { FundRisk } from "./fund-list-data";
import type { DividendMode } from "@/types/fund";

export type FundSortBy = "marketValue" | "return1y" | "unrealizedPnl";

interface FundFilterPanelProps {
  keyword: string;
  currencyFilter: "all" | "TWD" | "USD";
  riskFilter: "all" | FundRisk;
  dividendFilter: "all" | DividendMode;
  sortBy: FundSortBy;
  onKeywordChange: (value: string) => void;
  onCurrencyFilterChange: (value: "all" | "TWD" | "USD") => void;
  onRiskFilterChange: (value: "all" | FundRisk) => void;
  onDividendFilterChange: (value: "all" | DividendMode) => void;
  onSortByChange: (value: FundSortBy) => void;
}

export const FundFilterPanel = ({
  keyword,
  currencyFilter,
  riskFilter,
  dividendFilter,
  sortBy,
  onKeywordChange,
  onCurrencyFilterChange,
  onRiskFilterChange,
  onDividendFilterChange,
  onSortByChange,
}: FundFilterPanelProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          篩選與排序
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative md:col-span-2 xl:col-span-2">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={event => onKeywordChange(event.target.value)}
              placeholder="搜尋基金名稱、代碼、投信"
              className="pl-9"
            />
          </div>
          <Select
            value={currencyFilter}
            onValueChange={value => onCurrencyFilterChange(value as "all" | "TWD" | "USD")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="幣別" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部幣別</SelectItem>
              <SelectItem value="TWD">TWD</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={riskFilter}
            onValueChange={value => onRiskFilterChange(value as "all" | FundRisk)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="風險等級" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部風險</SelectItem>
              <SelectItem value="RR1">RR1</SelectItem>
              <SelectItem value="RR2">RR2</SelectItem>
              <SelectItem value="RR3">RR3</SelectItem>
              <SelectItem value="RR4">RR4</SelectItem>
              <SelectItem value="RR5">RR5</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={dividendFilter}
            onValueChange={value => onDividendFilterChange(value as "all" | DividendMode)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="配息方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部配息</SelectItem>
              <SelectItem value="cash">現金配息</SelectItem>
              <SelectItem value="reinvest">配息再投入</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">排序：</span>
          <Button
            size="xs"
            variant={sortBy === "marketValue" ? "default" : "outline"}
            onClick={() => onSortByChange("marketValue")}
          >
            市值
          </Button>
          <Button
            size="xs"
            variant={sortBy === "unrealizedPnl" ? "default" : "outline"}
            onClick={() => onSortByChange("unrealizedPnl")}
          >
            損益
          </Button>
          <Button
            size="xs"
            variant={sortBy === "return1y" ? "default" : "outline"}
            onClick={() => onSortByChange("return1y")}
          >
            一年報酬
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
