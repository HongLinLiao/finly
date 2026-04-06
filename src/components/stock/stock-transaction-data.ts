import type { TradeSide } from "@/types";

export const sideLabels: Record<TradeSide, string> = {
  buy: "買進",
  sell: "賣出",
};

export const boardLotLabels: Record<"regular" | "odd", string> = {
  regular: "整股",
  odd: "零股",
};

const pad2 = (value: number) => value.toString().padStart(2, "0");

export const formatDateTime = (timestamp?: number) => {
  if (!timestamp) return "—";
  const date = new Date((timestamp + 8 * 60 * 60) * 1000);
  const year = date.getUTCFullYear();
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());
  const hour = pad2(date.getUTCHours());
  const minute = pad2(date.getUTCMinutes());

  return `${year}/${month}/${day} ${hour}:${minute}`;
};

export const formatNumber = (value: number, fractionDigits = 0) => {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const fixed = abs.toFixed(fractionDigits);
  const [integerPart, decimalPart] = fixed.split(".");
  const withComma = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (!decimalPart) return `${sign}${withComma}`;
  return `${sign}${withComma}.${decimalPart}`;
};

export const formatCurrency = (amount: number, currency: string) => {
  const fractionDigits = currency === "TWD" ? 0 : 2;
  return `${currency} ${formatNumber(amount, fractionDigits)}`;
};
