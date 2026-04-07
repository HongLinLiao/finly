"use client";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import { AccountBalanceCard } from "./account-balance-card";

import type { OverviewCashAccount } from "@/app/mock";

interface AccountBalanceGridProps {
  accounts: OverviewCashAccount[];
}

export function AccountBalanceGrid({ accounts }: AccountBalanceGridProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="mt-1 text-xl font-semibold text-foreground dark:text-zinc-50">
            台外幣餘額總覽
          </h2>
        </div>
      </div>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
      >
        <CarouselContent className="-ml-4">
          {accounts.map(account => (
            <CarouselItem
              key={account.id}
              className="pl-4 basis-[95.238%] sm:basis-[55.556%] lg:basis-[41.667%] xl:basis-[31.25%] 2xl:basis-1/4"
            >
              <AccountBalanceCard account={account} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
