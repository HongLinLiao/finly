import { Landmark, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface AccountBalanceCardProps {
  title: string;
  subtitle?: string;
  balances: {
    id: string;
    label: string;
    currency: string;
    balance: number;
  }[];
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function AccountBalanceCard({ title, subtitle, balances }: AccountBalanceCardProps) {
  const primaryBalance = balances[0];
  const hasMultipleBalances = balances.length > 1;

  return (
    <Card className="group relative h-full overflow-hidden py-0 shadow-none transition duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.12),transparent_38%)] dark:bg-[radial-gradient(circle_at_100%_0%,rgba(52,211,153,0.14),transparent_38%)]" />

      <CardContent className="relative space-y-4 px-5 py-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-foreground/90 dark:text-zinc-200">{title}</h3>
            {subtitle ? (
              <p className="mt-1 truncate text-xs text-muted-foreground dark:text-zinc-500">
                {subtitle}
              </p>
            ) : null}
          </div>

          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
            {!hasMultipleBalances && primaryBalance?.currency === "TWD" ? (
              <Landmark className="h-4 w-4" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
          </span>
        </header>

        <section>
          <p className="text-xs text-muted-foreground dark:text-zinc-500">
            {hasMultipleBalances ? "多幣別餘額" : "總餘額"}
          </p>
          <p className="mt-1 text-[1.65rem] leading-none font-semibold tracking-tight text-foreground dark:text-zinc-50">
            {hasMultipleBalances
              ? `${balances.length} 個幣別`
              : formatCurrency(primaryBalance?.balance ?? 0, primaryBalance?.currency ?? "TWD")}
          </p>
        </section>

        {hasMultipleBalances ? (
          <section className="space-y-2">
            {balances.map(balance => (
              <div
                key={balance.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50/70 px-3 py-2 ring-1 ring-emerald-200/80 dark:bg-emerald-950/20 dark:ring-emerald-500/25"
              >
                <div className="min-w-0">
                  <p className="truncate text-[11px] text-muted-foreground dark:text-zinc-500">
                    {balance.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground dark:text-zinc-500">
                    {balance.currency}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm font-medium text-foreground dark:text-zinc-100">
                  {formatCurrency(balance.balance, balance.currency)}
                </p>
              </div>
            ))}
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
