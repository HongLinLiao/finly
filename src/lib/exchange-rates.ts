import "server-only";

const FRANKFURTER_API_BASE_URL = "https://api.frankfurter.dev";
const FALLBACK_RATES_TO_TWD: Record<string, number> = {
  TWD: 1,
  USD: 32,
  JPY: 0.22,
};
const EXCHANGE_RATE_REVALIDATE_SECONDS = 60 * 60 * 12;

interface FrankfurterLatestResponse {
  base?: string;
  date?: string;
  quote?: string;
  rate?: number;
}

async function fetchRateToTwd(currency: string) {
  const normalizedCurrency = currency.trim().toUpperCase();

  if (!normalizedCurrency || normalizedCurrency === "TWD") return 1;

  const url = new URL(`/v2/rate/${normalizedCurrency}/TWD`, FRANKFURTER_API_BASE_URL);

  const response = await fetch(url, {
    next: { revalidate: EXCHANGE_RATE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Frankfurter request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as FrankfurterLatestResponse;
  const rate = data.rate;

  if (!rate || !Number.isFinite(rate)) {
    throw new Error(`Frankfurter response did not include a TWD rate for ${normalizedCurrency}.`);
  }

  return rate;
}

export async function getExchangeRatesToTwd(currencies: string[]) {
  const uniqueCurrencies = Array.from(
    new Set(currencies.map(currency => currency.trim().toUpperCase()).filter(Boolean))
  );
  const rates: Record<string, number> = { TWD: 1 };

  await Promise.all(
    uniqueCurrencies.map(async currency => {
      if (currency === "TWD") return;

      try {
        rates[currency] = await fetchRateToTwd(currency);
      } catch (error) {
        console.error(`Failed to fetch ${currency}/TWD exchange rate.`, error);
        rates[currency] = FALLBACK_RATES_TO_TWD[currency] ?? 1;
      }
    })
  );

  return rates;
}

export function toTwdValue(value: number, currency: string, ratesToTwd: Record<string, number>) {
  const normalizedCurrency = currency.trim().toUpperCase();

  return value * (ratesToTwd[normalizedCurrency] ?? FALLBACK_RATES_TO_TWD[normalizedCurrency] ?? 1);
}
