export const formatNumber = (value: number, fractionDigits = 0) => {
  return new Intl.NumberFormat("zh-TW", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

export const formatCurrency = (value: number, currency: string) => {
  const normalizedCurrency = currency.trim().toUpperCase();
  const fractionDigits = normalizedCurrency === "TWD" ? 0 : 2;

  return `${normalizedCurrency} $${new Intl.NumberFormat("zh-TW", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)}`;
};

export const formatPrice = (value: number, currency: string) => {
  const normalizedCurrency = currency.trim().toUpperCase();

  return `${normalizedCurrency} $${new Intl.NumberFormat("zh-TW", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
};

export const formatPercent = (value: number) => {
  const roundedValue = Number(
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(value)
  );

  return `${roundedValue > 0 ? "+" : ""}${roundedValue.toFixed(2)}%`;
};
