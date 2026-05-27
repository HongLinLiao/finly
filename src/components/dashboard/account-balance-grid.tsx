"use client";

import { Check, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toTwdValue } from "@/lib/currency-conversion";
import { addMoney } from "@/lib/money";

import { AccountBalanceCard } from "./account-balance-card";

import type { OverviewCashAccount } from "@/types/dashboard";

interface AccountBalanceGridProps {
  accounts: OverviewCashAccount[];
  ratesToTwd: Record<string, number>;
}

type BalanceViewMode = "cash" | "brokerage";

const viewModeLabels: Record<BalanceViewMode, string> = {
  cash: "資金戶",
  brokerage: "證券戶",
};

export function AccountBalanceGrid({ accounts, ratesToTwd }: AccountBalanceGridProps) {
  const [viewMode, setViewMode] = useState<BalanceViewMode>("cash");
  const cardItems = useMemo(() => {
    if (viewMode === "cash") {
      return accounts.map(account => ({
        id: account.id,
        title: account.account_name ?? account.currency,
        subtitle: account.brokerageAccountName,
        summary: {
          label: "總餘額",
          value: account.balance,
          currency: account.currency,
        },
        balances: [
          {
            id: account.id,
            label: account.account_name ?? account.currency,
            currency: account.currency,
            balance: account.balance,
          },
        ],
      }));
    }

    const accountMap = accounts.reduce(
      (map, account) => {
        const item = map.get(account.brokerage_account_id) ?? {
          id: account.brokerage_account_id,
          title: account.brokerageAccountName,
          subtitle: "",
          totalTwdBalance: 0,
          balances: new Map<
            string,
            {
              id: string;
              label: string;
              currency: string;
              balance: number;
            }
          >(),
        };

        item.totalTwdBalance = addMoney(
          item.totalTwdBalance,
          toTwdValue(account.balance, account.currency, ratesToTwd)
        );
        const existing = item.balances.get(account.id) ?? {
          id: account.id,
          label: account.account_name ?? account.currency,
          currency: account.currency,
          balance: 0,
        };

        existing.balance = addMoney(existing.balance, account.balance);
        item.balances.set(account.id, existing);
        map.set(account.brokerage_account_id, item);

        return map;
      },
      new Map<
        string,
        {
          id: string;
          title: string;
          subtitle: string;
          totalTwdBalance: number;
          balances: Map<
            string,
            {
              id: string;
              label: string;
              currency: string;
              balance: number;
            }
          >;
        }
      >()
    );

    return Array.from(accountMap.values()).map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      summary: {
        label: "折合台幣總額",
        value: item.totalTwdBalance,
        currency: "TWD",
      },
      balances: Array.from(item.balances.values()).sort(
        (a, b) => a.currency.localeCompare(b.currency) || a.label.localeCompare(b.label)
      ),
    }));
  }, [accounts, ratesToTwd, viewMode]);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="mt-1 text-xl font-semibold text-foreground dark:text-zinc-50">
            台外幣餘額總覽
          </h2>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label="調整餘額顯示方式">
              <SlidersHorizontal />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <PopoverHeader>
              <PopoverTitle>顯示方式</PopoverTitle>
            </PopoverHeader>
            <div className="grid gap-2">
              {(["cash", "brokerage"] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted dark:bg-zinc-900/60 dark:hover:bg-zinc-900"
                  onClick={() => setViewMode(mode)}
                >
                  <span className="font-medium text-foreground">{viewModeLabels[mode]}</span>
                  {viewMode === mode ? <Check className="size-4 text-primary" /> : null}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
      >
        <CarouselContent className="-ml-4">
          {cardItems.map(item => (
            <CarouselItem
              key={item.id}
              className="pl-4 basis-[95.238%] sm:basis-[55.556%] lg:basis-[41.667%] xl:basis-[31.25%] 2xl:basis-1/4"
            >
              <AccountBalanceCard
                title={item.title}
                subtitle={item.subtitle}
                summary={item.summary}
                balances={item.balances}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
