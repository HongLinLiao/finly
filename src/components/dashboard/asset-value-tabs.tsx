"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AssetValueChartCard } from "./asset-value-chart-card";

import type { AssetValueItem } from "@/app/mock";

interface AssetValueTabsProps {
  stockValues: AssetValueItem[];
  fundValues: AssetValueItem[];
}

export function AssetValueTabs({ stockValues, fundValues }: AssetValueTabsProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="mt-1 text-xl font-semibold text-zinc-50">資產現值總覽</h2>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-zinc-900/90 p-1">
          <TabsTrigger
            value="stock"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-300"
          >
            股票現值
          </TabsTrigger>
          <TabsTrigger
            value="fund"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-300"
          >
            基金現值
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <AssetValueChartCard title="股票現值" items={stockValues} />
        </TabsContent>

        <TabsContent value="fund">
          <AssetValueChartCard title="基金現值" items={fundValues} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
