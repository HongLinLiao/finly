import { Landmark, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { OverviewCashAccount } from "@/app/mock";

interface AccountBalanceCardProps {
  account: OverviewCashAccount;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function AccountBalanceCard({ account }: AccountBalanceCardProps) {
  const total = Math.max(account.balance, 1);
  const availableRatio = (account.available / total) * 100;
  const pendingRatio = (account.pending / total) * 100;

  return (
    <Card className="group relative h-full overflow-hidden border-zinc-900/80 bg-[linear-gradient(165deg,#101113_0%,#0a0b0d_100%)] py-0 shadow-[0_20px_40px_-24px_rgba(0,0,0,1)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_56px_-30px_rgba(0,0,0,1)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(34,197,94,0.14),transparent_38%)]" />

      <CardContent className="relative space-y-4 px-5 py-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-zinc-200">{account.accountName}</h3>
          </div>

          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-emerald-300 ring-1 ring-zinc-800">
            {account.kind === "twd" ? (
              <Landmark className="h-4 w-4" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
          </span>
        </header>

        <section>
          <p className="text-xs text-zinc-500">總餘額</p>
          <p className="mt-1 text-[1.65rem] leading-none font-semibold tracking-tight text-zinc-50">
            {formatCurrency(account.balance, account.currency)}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-zinc-900/70 p-3 ring-1 ring-zinc-800/80">
            <p className="text-[11px] text-zinc-500">可動用</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">
              {formatCurrency(account.available, account.currency)}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${Math.max(8, Math.min(availableRatio, 100))}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900/70 p-3 ring-1 ring-zinc-800/80">
            <p className="text-[11px] text-zinc-500">待交割</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">
              {formatCurrency(account.pending, account.currency)}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-400"
                style={{ width: `${Math.max(8, Math.min(pendingRatio, 100))}%` }}
              />
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
