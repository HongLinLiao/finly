"use client";

import { useState } from "react";
import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import { addMoney, divideMoney, multiplyMoney } from "@/lib/money";

import type { AssetValueItem } from "@/types/dashboard";

interface AssetValueChartCardProps {
  title: string;
  items: AssetValueItem[];
}

interface AssetTooltipItem {
  name: string;
  code: string;
  value: number;
  currency: string;
  ratio: number;
  unrealizedReturnRate: number;
  accountValues: { accountName: string; marketValue: number }[];
}

function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function getSliceColor(index: number) {
  const hue = (index * 137.508 + 262) % 360;
  const saturation = index % 3 === 0 ? 66 : index % 3 === 1 ? 72 : 58;
  const lightness = index % 2 === 0 ? 45 : 56;

  return `hsl(${hue.toFixed(3)} ${saturation}% ${lightness}%)`;
}

function AssetTooltipBody({ item }: { item: AssetTooltipItem }) {
  const returnColor =
    item.unrealizedReturnRate >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";
  const accountValues = [...item.accountValues].sort((a, b) => b.marketValue - a.marketValue);

  return (
    <div className="grid min-w-56 gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground dark:text-zinc-400">現值</span>
        <span className="font-mono text-foreground dark:text-zinc-100">
          {formatCurrency(item.value, item.currency)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground dark:text-zinc-400">佔比</span>
        <span className="font-mono text-foreground dark:text-zinc-100">
          {item.ratio.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground dark:text-zinc-400">未實現報酬率</span>
        <span className={`font-mono ${returnColor}`}>
          {formatPercent(item.unrealizedReturnRate)}
        </span>
      </div>
      <div className="space-y-1 border-t border-border/80 pt-1.5">
        {accountValues.map(account => {
          const ratio =
            item.value > 0 ? multiplyMoney(divideMoney(account.marketValue, item.value), 100) : 0;

          return (
            <div key={account.accountName} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground dark:text-zinc-400">
                {account.accountName}
              </span>
              <span className="text-right font-mono text-foreground dark:text-zinc-100">
                {formatCurrency(account.marketValue, item.currency)}
                <span className="ml-1 text-muted-foreground dark:text-zinc-500">
                  ({ratio.toFixed(1)}%)
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AssetValueChartCard({ title, items }: AssetValueChartCardProps) {
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
  const total = items.reduce((sum, item) => addMoney(sum, item.marketValue), 0);

  const chartConfig = items.reduce<ChartConfig>((acc, item, index) => {
    acc[`slice${index}`] = {
      label: `${item.name} (${item.code})`,
      color: getSliceColor(index),
    };

    return acc;
  }, {});

  const chartData = items.map((item, index) => ({
    key: `slice${index}`,
    name: item.name,
    code: item.code,
    value: item.marketValue,
    currency: item.currency,
    unrealizedReturnRate: item.unrealizedReturnRate,
    accountValues: item.accountValues,
    color: getSliceColor(index),
    fill: `var(--color-slice${index})`,
    ratio: total > 0 ? multiplyMoney(divideMoney(item.marketValue, total), 100) : 0,
  }));
  const activeTooltipItem = activeTooltipIndex === null ? null : chartData[activeTooltipIndex];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground dark:text-zinc-50">{title}</h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative mx-auto aspect-square max-h-[290px]">
          <ChartContainer className="h-full w-full" config={chartConfig}>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(_value, _name, payload) => {
                      const item = (payload as { payload?: AssetTooltipItem } | undefined)?.payload;

                      return item ? <AssetTooltipBody item={item} /> : null;
                    }}
                    labelFormatter={(_, payload) => {
                      const item = payload?.[0]?.payload as
                        | { name?: string; code?: string }
                        | undefined;

                      if (!item?.name) {
                        return "";
                      }

                      return `${item.name}${item.code ? ` (${item.code})` : ""}`;
                    }}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={72}
                outerRadius={106}
                strokeWidth={2}
              />
            </PieChart>
          </ChartContainer>

          {activeTooltipItem ? (
            <div className="pointer-events-none absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-xl bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10">
              <div className="mb-1.5 font-medium">
                {activeTooltipItem.name}
                {activeTooltipItem.code ? ` (${activeTooltipItem.code})` : ""}
              </div>
              <AssetTooltipBody item={activeTooltipItem} />
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          {chartData.map((item, index) => {
            const returnColor =
              item.unrealizedReturnRate >= 0
                ? "text-emerald-600 dark:text-emerald-300"
                : "text-rose-500";

            return (
              <div
                key={item.key}
                tabIndex={0}
                className="flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-2 text-xs outline-none transition-colors hover:bg-emerald-100/80 focus-visible:ring-2 focus-visible:ring-ring dark:border-emerald-500/25 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/25"
                onMouseEnter={() => setActiveTooltipIndex(index)}
                onMouseLeave={() => setActiveTooltipIndex(null)}
                onFocus={() => setActiveTooltipIndex(index)}
                onBlur={() => setActiveTooltipIndex(null)}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <p className="truncate text-foreground/90 dark:text-zinc-300">
                    {item.name}{" "}
                    <span className="text-muted-foreground dark:text-zinc-500">{item.code}</span>
                  </p>
                </div>
                <p className="hidden shrink-0 whitespace-nowrap text-right font-mono text-foreground/85 sm:block dark:text-zinc-300">
                  {item.ratio.toFixed(1)}%
                </p>
                <p className={`shrink-0 whitespace-nowrap text-right font-mono ${returnColor}`}>
                  {formatPercent(item.unrealizedReturnRate)}
                </p>
                <p className="shrink-0 whitespace-nowrap text-right font-mono text-foreground dark:text-zinc-100">
                  {formatCurrency(item.value, item.currency)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
