"use client";

import { Swiper, SwiperSlide } from "swiper/react";

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

      <Swiper
        spaceBetween={16}
        slidesPerView={1.05}
        breakpoints={{
          640: { slidesPerView: 1.8 },
          1024: { slidesPerView: 2.4 },
          1280: { slidesPerView: 3.2 },
          1536: { slidesPerView: 4 },
        }}
      >
        {accounts.map(account => (
          <SwiperSlide key={account.id}>
            <AccountBalanceCard account={account} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
