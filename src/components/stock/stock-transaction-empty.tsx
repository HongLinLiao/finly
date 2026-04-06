import { ReceiptText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function StockTransactionEmpty() {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <Empty className="border border-dashed border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-500/25 dark:bg-emerald-950/20">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            >
              <ReceiptText className="size-5" />
            </EmptyMedia>
            <EmptyTitle className="text-foreground dark:text-zinc-100">
              查無符合條件的交易
            </EmptyTitle>
            <EmptyDescription className="text-muted-foreground dark:text-zinc-400">
              請調整篩選條件後再試一次。
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}
