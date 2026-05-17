import { Building2 } from "lucide-react";
import { redirect } from "next/navigation";

import { AddAccountFab } from "@/components/brokerage/add-account-fab";
import { BrokerageAccountList } from "@/components/brokerage/brokerage-account-list";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import Page from "@/components/util/Page";
import { getCurrentUser } from "@/lib/auth/current-user";
import { cn } from "@/lib/utils";
import getBrokerageAccounts from "@/services/brokerage/getBrokerageAccounts";
import getCurrencies from "@/services/currency/getCurrencies";

export const dynamic = "force-dynamic";

const labelClassName = "text-xs text-muted-foreground dark:text-zinc-500";
const valueClassName = "text-foreground dark:text-zinc-50";

const BrokeragesPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?returnTo=%2Fbrokerages");
  }

  const [accounts, currencies] = await Promise.all([
    getBrokerageAccounts(user.uid),
    getCurrencies(),
  ]);
  const activeCount = accounts.filter(account => account.status === "active").length;
  const cashAccountCount = accounts.reduce(
    (total, account) => total + account.securities_cash_accounts.length,
    0
  );

  return (
    <Page breadcrumbs={[{ label: "證券戶設定", active: true }]}>
      <section className="space-y-5">
        <header className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground dark:text-zinc-50">
            證券戶
          </h1>

          <div className="grid grid-cols-2 gap-2 sm:max-w-md">
            <div className="rounded-2xl border bg-card px-4 py-3">
              <p className={labelClassName}>啟用帳戶</p>
              <p className={cn("mt-1 text-xl font-semibold", valueClassName)}>{activeCount}</p>
            </div>
            <div className="rounded-2xl border bg-card px-4 py-3">
              <p className={labelClassName}>資金帳戶</p>
              <p className={cn("mt-1 text-xl font-semibold", valueClassName)}>{cashAccountCount}</p>
            </div>
          </div>
        </header>

        {accounts.length === 0 ? (
          <Empty className="min-h-72 border bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 />
              </EmptyMedia>
              <EmptyTitle>尚未建立帳戶</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <BrokerageAccountList accounts={accounts} />
        )}
      </section>
      <AddAccountFab accounts={accounts} currencies={currencies} />
    </Page>
  );
};

export default BrokeragesPage;
