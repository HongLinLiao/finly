export const FALLBACK_RATES_TO_TWD: Record<string, number> = {
  TWD: 1,
  USD: 32,
  JPY: 0.22,
};

export function toTwdValue(value: number, currency: string, ratesToTwd: Record<string, number>) {
  const normalizedCurrency = currency.trim().toUpperCase();

  return value * (ratesToTwd[normalizedCurrency] ?? FALLBACK_RATES_TO_TWD[normalizedCurrency] ?? 1);
}
