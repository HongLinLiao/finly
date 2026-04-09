import type { FundCurrency } from "./fund-list-data";

export const formatCurrency = (value: number, currency: FundCurrency) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-TW").format(value);

export const formatPercent = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
