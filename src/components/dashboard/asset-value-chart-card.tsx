"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import type { AssetValueItem } from "@/app/mock";

interface AssetValueChartCardProps {
  title: string;
  items: AssetValueItem[];
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function AssetValueChartCard({ title, items }: AssetValueChartCardProps) {
  const total = items.reduce((sum, item) => sum + item.marketValue, 0);
  const palette = ["#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#93c5fd"];

  const chartConfig = items.reduce<ChartConfig>((acc, item, index) => {
    acc[`slice${index}`] = {
      label: `${item.name} (${item.code})`,
      color: palette[index % palette.length],
    };

    return acc;
  }, {});

  const chartData = items.map((item, index) => ({
    key: `slice${index}`,
    name: item.name,
    code: item.code,
    value: item.marketValue,
    currency: item.currency,
    accountValues: item.accountValues,
    fill: `var(--color-slice${index})`,
    ratio: total > 0 ? (item.marketValue / total) * 100 : 0,
  }));

  return (
    <Card className="border-zinc-800/90 bg-zinc-950/90 text-zinc-100 shadow-[0_20px_50px_-34px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-zinc-50">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <ChartContainer className="mx-auto aspect-square max-h-[290px]" config={chartConfig}>
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name, payload) => {
                    const item = payload as
                      | {
                          payload?: {
                            currency?: string;
                            accountValues?: { accountName: string; marketValue: number }[];
                          };
                        }
                      | undefined;

                    const currency = item?.payload?.currency ?? "TWD";
                    const totalValue = Number(value);
                    const accountValues = [...(item?.payload?.accountValues ?? [])].sort(
                      (a, b) => b.marketValue - a.marketValue
                    );

                    return (
                      <div className="grid min-w-56 gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-zinc-400">{name}</span>
                          <span className="font-mono text-zinc-100">
                            {formatCurrency(totalValue, currency)}
                          </span>
                        </div>
                        <div className="space-y-1 border-t border-zinc-700/70 pt-1.5">
                          {accountValues.map(account => {
                            const ratio =
                              totalValue > 0 ? (account.marketValue / totalValue) * 100 : 0;

                            return (
                              <div
                                key={account.accountName}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="text-zinc-400">{account.accountName}</span>
                                <span className="text-right font-mono text-zinc-100">
                                  {formatCurrency(account.marketValue, currency)}
                                  <span className="ml-1 text-zinc-500">({ratio.toFixed(1)}%)</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
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

        <div className="space-y-2">
          {chartData.map(item => (
            <div
              key={item.key}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs"
            >
              <p className="truncate text-zinc-300">
                {item.name} <span className="text-zinc-500">{item.code}</span>
              </p>
              <p className="font-mono text-zinc-300">{item.ratio.toFixed(1)}%</p>
              <p className="font-mono text-zinc-100">{formatCurrency(item.value, item.currency)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
