import type { TradeSide } from "@/types";

export function calculateGrossAmount(quantity: number, unitPrice: number) {
  return quantity * unitPrice;
}

export function calculateNetAmount(
  side: TradeSide,
  grossAmount: number,
  fee?: number | null,
  tax?: number | null
) {
  const feeAmount = fee ?? 0;
  const taxAmount = tax ?? 0;

  return side === "sell"
    ? grossAmount - feeAmount - taxAmount
    : grossAmount + feeAmount + taxAmount;
}

export function getEffectiveGrossAmount({
  grossAmount,
  quantity,
  unitPrice,
}: {
  grossAmount?: number | null;
  quantity: number;
  unitPrice: number;
}) {
  return grossAmount ?? calculateGrossAmount(quantity, unitPrice);
}

export function getEffectiveNetAmount({
  side,
  grossAmount,
  netAmount,
  fee,
  tax,
}: {
  side: TradeSide;
  grossAmount: number;
  netAmount?: number | null;
  fee?: number | null;
  tax?: number | null;
}) {
  return netAmount ?? calculateNetAmount(side, grossAmount, fee, tax);
}
