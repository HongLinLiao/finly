import "server-only";

export interface CurrencyOption {
  code: string;
  name: string;
  symbol?: string | null;
}

type FrankfurterCurrency = {
  iso_code?: unknown;
  name?: unknown;
  symbol?: unknown;
};

const FRANKFURTER_CURRENCIES_URL = "https://api.frankfurter.dev/v2/currencies";
const TAIPEI_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

const FALLBACK_CURRENCIES: CurrencyOption[] = [
  { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$" },
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
];

const PRIORITY_CODES = ["TWD", "USD", "EUR", "JPY", "HKD"];

function getSecondsUntilNextTaipeiMidnight(now = new Date()) {
  const taipeiNow = new Date(now.getTime() + TAIPEI_UTC_OFFSET_MS);
  const nextTaipeiMidnight = Date.UTC(
    taipeiNow.getUTCFullYear(),
    taipeiNow.getUTCMonth(),
    taipeiNow.getUTCDate() + 1
  );
  const nextTaipeiMidnightUtc = nextTaipeiMidnight - TAIPEI_UTC_OFFSET_MS;
  const seconds = Math.ceil((nextTaipeiMidnightUtc - now.getTime()) / 1000);

  return Math.max(60, seconds);
}

function normalizeCurrencyOption(currency: FrankfurterCurrency): CurrencyOption | null {
  if (typeof currency.iso_code !== "string" || typeof currency.name !== "string") {
    return null;
  }

  const code = currency.iso_code.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(code)) return null;

  return {
    code,
    name: currency.name.trim(),
    symbol: typeof currency.symbol === "string" ? currency.symbol : null,
  };
}

function sortCurrencies(a: CurrencyOption, b: CurrencyOption) {
  const priorityA = PRIORITY_CODES.indexOf(a.code);
  const priorityB = PRIORITY_CODES.indexOf(b.code);

  if (priorityA !== -1 || priorityB !== -1) {
    return (
      (priorityA === -1 ? Number.MAX_SAFE_INTEGER : priorityA) -
      (priorityB === -1 ? Number.MAX_SAFE_INTEGER : priorityB)
    );
  }

  return a.code.localeCompare(b.code);
}

export async function fetchFrankfurterCurrencies(): Promise<CurrencyOption[]> {
  try {
    const response = await fetch(FRANKFURTER_CURRENCIES_URL, {
      next: { revalidate: getSecondsUntilNextTaipeiMidnight() },
    });

    if (!response.ok) {
      throw new Error(`Frankfurter currencies request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as unknown;

    if (!Array.isArray(data)) {
      throw new Error("Frankfurter currencies response is not an array.");
    }

    const currencies = data
      .map(item => normalizeCurrencyOption(item as FrankfurterCurrency))
      .filter((item): item is CurrencyOption => Boolean(item))
      .sort(sortCurrencies);

    return currencies.length > 0 ? currencies : FALLBACK_CURRENCIES;
  } catch (error) {
    console.error("Failed to fetch Frankfurter currencies:", error);

    return FALLBACK_CURRENCIES;
  }
}
