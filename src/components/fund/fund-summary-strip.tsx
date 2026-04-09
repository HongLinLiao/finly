import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { formatNumber, formatPercent } from "./fund-format";

interface FundSummaryStripProps {
  count: number;
  marketValue: number;
  unrealizedPnl: number;
  avgReturn1y: number;
}

export const FundSummaryStrip = ({
  count,
  marketValue,
  unrealizedPnl,
  avgReturn1y,
}: FundSummaryStripProps) => {
  const pnlColor = unrealizedPnl >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";
  const returnColor = avgReturn1y >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground dark:text-zinc-500">
            基金檔數
          </CardDescription>
          <CardTitle className="text-xl">{count}</CardTitle>
        </CardHeader>
      </Card>
      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground dark:text-zinc-500">
            總市值（名目）
          </CardDescription>
          <CardTitle className="text-xl">{formatNumber(marketValue)}</CardTitle>
        </CardHeader>
      </Card>
      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground dark:text-zinc-500">
            未實現損益（名目）
          </CardDescription>
          <CardTitle className={pnlColor}>{formatNumber(unrealizedPnl)}</CardTitle>
        </CardHeader>
      </Card>
      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground dark:text-zinc-500">
            平均一年報酬
          </CardDescription>
          <CardTitle className={returnColor}>{formatPercent(avgReturn1y)}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};
