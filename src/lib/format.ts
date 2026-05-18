export const truncateToDigits = (value: number, fractionDigits: number) => {
  const factor = 10 ** fractionDigits;
  return Math.trunc(value * factor) / factor;
};

export const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(truncateToDigits(value, 0));

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 0,
  }).format(truncateToDigits(value, 0));

export const formatPercent = (value: number) => {
  const truncatedValue = truncateToDigits(value, 2);
  return `${truncatedValue > 0 ? "+" : ""}${truncatedValue.toFixed(2)}%`;
};
