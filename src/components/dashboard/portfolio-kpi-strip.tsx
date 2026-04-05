"use client";

import { Coins, Landmark, LineChart, PiggyBank } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";

import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="h-full rounded-2xl border-zinc-800 bg-zinc-950 py-0 shadow-[0_18px_36px_-28px_rgba(0,0,0,1)]">
      <CardContent className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-zinc-500 uppercase">{label}</p>
            <p className="mt-2 text-xl font-semibold text-zinc-100">
              {formatCompactCurrency(value)}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-900/60 bg-emerald-950/50 text-emerald-300">
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
          <h2 className="mt-1 text-xl font-semibold text-zinc-50">資產總覽</h2>
        </div>
      </div>

      <Swiper
        spaceBetween={12}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.05 },
          1024: { slidesPerView: 3.05 },
          1280: { slidesPerView: 4 },
        }}
      >
        {kpis.map(kpi => (
          <SwiperSlide key={kpi.label} className="h-auto">
            <KpiCard label={kpi.label} value={kpi.value} icon={kpi.icon} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
