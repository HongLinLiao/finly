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
    <Card className="border border-dashed border-zinc-700/80 bg-zinc-950/70">
      <CardContent className="pt-6">
        <Empty className="border border-dashed border-zinc-700 bg-zinc-900/45">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-zinc-800 text-emerald-300">
              <ReceiptText className="size-5" />
            </EmptyMedia>
            <EmptyTitle className="text-zinc-100">查無符合條件的交易</EmptyTitle>
            <EmptyDescription className="text-zinc-400">
              請調整篩選條件後再試一次。
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}
