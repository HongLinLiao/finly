import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/format";

interface FundSummaryStripProps {
  count: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedReturnRate: number;
}

export const FundSummaryStrip = ({
  count,
  marketValue,
  unrealizedPnl,
  unrealizedReturnRate,
}: FundSummaryStripProps) => {
  const pnlColor = unrealizedPnl >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";
  const returnColor =
    unrealizedReturnRate >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";

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
            總市值
          </CardDescription>
          <CardTitle className="text-xl">{formatNumber(marketValue)}</CardTitle>
        </CardHeader>
      </Card>
      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground dark:text-zinc-500">
            未實現損益
          </CardDescription>
          <CardTitle className={pnlColor}>{formatNumber(unrealizedPnl)}</CardTitle>
        </CardHeader>
      </Card>
      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground dark:text-zinc-500">
            未實現報酬率
          </CardDescription>
          <CardTitle className={returnColor}>{formatPercent(unrealizedReturnRate)}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};
