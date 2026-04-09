import { HandCoins } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const FundEmptyState = () => {
  return (
    <Empty className="border border-dashed border-border bg-muted/40 dark:border-white/10 dark:bg-zinc-900/60">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-muted text-muted-foreground">
          <HandCoins />
        </EmptyMedia>
        <EmptyTitle>找不到符合條件的基金</EmptyTitle>
        <EmptyDescription>調整篩選條件，或清空關鍵字後再試一次。</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
