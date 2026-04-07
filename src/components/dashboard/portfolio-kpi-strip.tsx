"use client";

import { Coins, Landmark, LineChart, PiggyBank } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import type { ComponentType } from "react";

interface PortfolioKpiStripProps {
  twdCashTotal: number;
  foreignCashTotal: number;
  stockTotalValue: number;
  fundTotalValue: number;
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="h-full rounded-2xl py-0 shadow-none">
      <CardContent className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase dark:text-zinc-500">
              {label}
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground dark:text-zinc-100">
              {formatCompactCurrency(value)}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Icon className="h-4 w-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortfolioKpiStrip({
  twdCashTotal,
  foreignCashTotal,
  stockTotalValue,
  fundTotalValue,
}: PortfolioKpiStripProps) {
  const kpis = [
    {
      label: "台幣現金總額",
      value: twdCashTotal,
      icon: Landmark,
    },
    {
      label: "外幣折台總額",
      value: foreignCashTotal,
      icon: Coins,
    },
    {
      label: "股票現值",
      value: stockTotalValue,
      icon: LineChart,
    },
    {
      label: "基金現值",
      value: fundTotalValue,
      icon: PiggyBank,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="mt-1 text-xl font-semibold text-foreground dark:text-zinc-50">資產總覽</h2>
        </div>
      </div>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
      >
        <CarouselContent className="-ml-3">
          {kpis.map(kpi => (
            <CarouselItem
              key={kpi.label}
              className="pl-3 basis-[83.333%] sm:basis-[48.78%] lg:basis-[32.79%] xl:basis-1/4"
            >
              <KpiCard label={kpi.label} value={kpi.value} icon={kpi.icon} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
