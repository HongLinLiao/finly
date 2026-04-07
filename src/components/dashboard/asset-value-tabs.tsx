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
        <h2 className="mt-1 text-xl font-semibold text-foreground dark:text-zinc-50">
          資產現值總覽
        </h2>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList variant="segmented" className="grid w-full grid-cols-2 p-1">
          <TabsTrigger value="stock">股票現值</TabsTrigger>
          <TabsTrigger value="fund">基金現值</TabsTrigger>
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
