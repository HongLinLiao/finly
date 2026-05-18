import { TrendingUp } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function StockTransactionEmpty() {
  return (
    <Empty className="border border-dashed border-border bg-muted/40 dark:border-white/10 dark:bg-zinc-900/60">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-muted text-muted-foreground">
          <TrendingUp className="size-5" />
        </EmptyMedia>
        <EmptyTitle>找不到符合條件的股票</EmptyTitle>
        <EmptyDescription>新增股票交易後，持倉會顯示在這裡。</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
