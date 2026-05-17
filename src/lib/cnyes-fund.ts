import "server-only";

export interface TaiwanFundOption {
  fundCode: string;
  fundName: string;
  companyName: string;
  currency: string;
  latestNav: number;
  latestNavDate: string;
}

interface CnyesSearchFundRecord {
  cnyesId?: unknown;
  fundYesId?: unknown;
  displayNameLocal?: unknown;
  classCurrencyLocal?: unknown;
  currency?: unknown;
  nav?: unknown;
  priceDate?: unknown;
  categoryAbbr?: unknown;
}

interface CnyesSearchFundResponse {
  items?: {
    data?: unknown[];
    current_page?: unknown;
    last_page?: unknown;
  };
}

const CNYES_FUND_SEARCH_URL = "https://fund.api.cnyes.com/fund/api/v2/search/fund";
const TAIPEI_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;
const CNYES_FUND_FETCH_TIMEOUT_MS = 10_000;
const CNYES_FUND_FAILURE_COOLDOWN_MS = 5 * 60 * 1000;
const CNYES_FUND_LIST_PAGE_SIZE = 100;
const CNYES_FUND_LIST_MAX_PAGES = 12;

let cnyesFundRetryAvailableAt = 0;

const FUND_COMPANY_PREFIXES = [
  ["富蘭克林華美", "富蘭克林華美投信"],
  ["富蘭克林坦伯頓", "富蘭克林坦伯頓"],
  ["富蘭克林", "富蘭克林"],
  ["安聯", "安聯投信"],
  ["元大", "元大投信"],
  ["統一", "統一投信"],
  ["群益", "群益投信"],
  ["富邦", "富邦投信"],
  ["國泰", "國泰投信"],
  ["復華", "復華投信"],
  ["合庫", "合庫投信"],
  ["瀚亞", "瀚亞投信"],
  ["野村", "野村投信"],
  ["摩根士丹利", "摩根士丹利"],
  ["摩根", "摩根投信"],
  ["施羅德", "施羅德"],
  ["貝萊德", "貝萊德"],
  ["法巴", "法巴"],
  ["荷寶", "荷寶"],
  ["百達", "百達"],
  ["東方匯理", "東方匯理"],
  ["DWS", "DWS"],
] as const;

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

function getErrorSummary(error: unknown) {
  if (error instanceof Error) {
    const cause =
      "cause" in error && error.cause instanceof Error ? `, cause: ${error.cause.name}` : "";

    return `${error.name}: ${error.message}${cause}`;
  }

  return "Unknown error";
}

async function fetchWithTimeout(url: URL, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: getSecondsUntilNextTaipeiMidnight() },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;

  return value as Record<string, unknown>;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value: unknown) {
  const normalized = typeof value === "number" ? value : Number(value);

  return Number.isFinite(normalized) ? normalized : null;
}

function normalizeCurrency(value: unknown) {
  const currency = normalizeText(value);

  if (currency === "新台幣" || currency === "台幣") return "TWD";
  if (currency === "美元" || currency === "美金") return "USD";
  if (currency === "人民幣") return "CNY";
  if (currency === "日圓" || currency === "日幣") return "JPY";
  if (currency === "歐元") return "EUR";
  if (currency === "澳幣") return "AUD";
  if (currency === "港幣") return "HKD";
  if (currency === "英鎊") return "GBP";

  return currency.toUpperCase() || "TWD";
}

function normalizeDateFromUnixSeconds(value: unknown) {
  const timestamp = normalizeNumber(value);

  if (!timestamp) return "";

  return new Date(timestamp * 1000).toISOString().slice(0, 10).replaceAll("-", "");
}

function stripHtml(value: unknown) {
  return normalizeText(value).replace(/<[^>]*>/g, "");
}

function inferCompanyNameFromFundName(value: unknown) {
  const fundName = stripHtml(value);

  if (!fundName) return "";

  const matchedCompany = FUND_COMPANY_PREFIXES.find(([prefix]) => fundName.startsWith(prefix));

  if (matchedCompany) return matchedCompany[1];

  const firstSegment = fundName.split(/[-－（(]/)[0]?.trim();

  return firstSegment && firstSegment.length <= 8 ? firstSegment : "";
}

function normalizeCnyesFundOption(value: unknown): TaiwanFundOption | null {
  const record = toRecord(value) as CnyesSearchFundRecord | null;

  if (!record) return null;

  const fundCode = normalizeText(record.cnyesId || record.fundYesId);
  const fundName = stripHtml(record.displayNameLocal);
  const latestNav = normalizeNumber(record.nav);
  const latestNavDate = normalizeDateFromUnixSeconds(record.priceDate);

  if (!fundCode || !fundName || !latestNav || !latestNavDate) return null;

  return {
    fundCode,
    fundName,
    companyName: inferCompanyNameFromFundName(fundName) || "未知投信",
    currency: normalizeCurrency(record.currency || record.classCurrencyLocal),
    latestNav,
    latestNavDate,
  };
}

function getSearchUrl(page: number) {
  const url = new URL(CNYES_FUND_SEARCH_URL);

  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(CNYES_FUND_LIST_PAGE_SIZE));
  url.searchParams.set("onshore", "1");
  url.searchParams.set("order", "priceDate");
  url.searchParams.set("sort", "desc");
  url.searchParams.set("isVendor", "0");
  url.searchParams.set("userFrom", "anue");

  return url;
}

async function fetchCnyesFundPage(page: number) {
  const response = await fetchWithTimeout(getSearchUrl(page), CNYES_FUND_FETCH_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error(`cnyes fund request failed with status ${response.status}.`);
  }

  return (await response.json()) as CnyesSearchFundResponse;
}

export async function fetchCnyesFundOptions(): Promise<TaiwanFundOption[]> {
  if (Date.now() < cnyesFundRetryAvailableAt) {
    return [];
  }

  try {
    const funds = new Map<string, TaiwanFundOption>();
    let lastPage = CNYES_FUND_LIST_MAX_PAGES;

    for (let page = 1; page <= Math.min(lastPage, CNYES_FUND_LIST_MAX_PAGES); page += 1) {
      const data = await fetchCnyesFundPage(page);
      const items = Array.isArray(data.items?.data) ? data.items.data : [];
      const normalizedLastPage = normalizeNumber(data.items?.last_page);

      if (normalizedLastPage) {
        lastPage = normalizedLastPage;
      }

      items.forEach(item => {
        const fund = normalizeCnyesFundOption(item);

        if (fund) {
          funds.set(fund.fundCode, fund);
        }
      });

      if (items.length === 0) break;
    }

    return Array.from(funds.values()).sort((a, b) =>
      a.fundName.localeCompare(b.fundName, "zh-Hant")
    );
  } catch (error) {
    cnyesFundRetryAvailableAt = Date.now() + CNYES_FUND_FAILURE_COOLDOWN_MS;
    console.error(`Failed to fetch cnyes fund records. ${getErrorSummary(error)}`);

    return [];
  }
}
