import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";

interface StockSummaryStripProps {
  count: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedReturnRate: number;
}

export const StockSummaryStrip = ({
  count,
  marketValue,
  unrealizedPnl,
  unrealizedReturnRate,
}: StockSummaryStripProps) => {
  const pnlColor = unrealizedPnl >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";
  const returnColor =
    unrealizedReturnRate >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground dark:text-zinc-500">
            股票檔數
          </CardDescription>
          <CardTitle className="text-xl">{count}</CardTitle>
        </CardHeader>
      </Card>
      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground dark:text-zinc-500">
            總市值（折合台幣）
          </CardDescription>
          <CardTitle className="text-xl">{formatCurrency(marketValue, "TWD")}</CardTitle>
        </CardHeader>
      </Card>
      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground dark:text-zinc-500">
            未實現損益（折合台幣）
          </CardDescription>
          <CardTitle className={pnlColor}>{formatCurrency(unrealizedPnl, "TWD")}</CardTitle>
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
