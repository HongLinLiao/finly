export const truncateToDigits = (value: number, fractionDigits: number) => {
  const factor = 10 ** fractionDigits;
  return Math.trunc(value * factor) / factor;
};

export const formatNumber = (value: number, fractionDigits = 0) => {
  const truncatedValue = truncateToDigits(value, fractionDigits);

  return new Intl.NumberFormat("zh-TW", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(truncatedValue);
};

export const formatCurrency = (value: number, currency: string) => {
  const normalizedCurrency = currency.trim().toUpperCase();
  const fractionDigits = normalizedCurrency === "TWD" ? 0 : 2;

  return `${normalizedCurrency} $${formatNumber(value, fractionDigits)}`;
};

export const formatPrice = (value: number, currency: string) => {
  const normalizedCurrency = currency.trim().toUpperCase();

  return `${normalizedCurrency} $${new Intl.NumberFormat("zh-TW", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
};

export const formatPercent = (value: number) => {
  const truncatedValue = truncateToDigits(value, 2);
  return `${truncatedValue > 0 ? "+" : ""}${truncatedValue.toFixed(2)}%`;
};
