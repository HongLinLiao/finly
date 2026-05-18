import "server-only";

import type { StockOption } from "@/types/stock-option";

interface YahooSearchQuote {
  exchange?: unknown;
  exchDisp?: unknown;
  longname?: unknown;
  quoteType?: unknown;
  shortname?: unknown;
  symbol?: unknown;
}

interface YahooSearchResponse {
  quotes?: unknown[];
}

interface YahooChartResponse {
  chart?: {
    result?: {
      meta?: {
        currency?: unknown;
        exchangeName?: unknown;
        fullExchangeName?: unknown;
        instrumentType?: unknown;
        longName?: unknown;
        shortName?: unknown;
        symbol?: unknown;
      };
    }[];
  };
}

const YAHOO_SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";
const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const STOCK_SEARCH_FETCH_TIMEOUT_MS = 10_000;
const STOCK_SEARCH_REVALIDATE_SECONDS = 60 * 60;
const SUPPORTED_QUOTE_TYPES = new Set(["EQUITY", "ETF"]);

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getErrorSummary(error: unknown) {
  if (error instanceof Error) {
    const cause =
      "cause" in error && error.cause instanceof Error ? `, cause: ${error.cause.name}` : "";

    return `${error.name}: ${error.message}${cause}`;
  }

  return "Unknown error";
}

async function fetchWithTimeout(url: URL, accept = "application/json") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STOCK_SEARCH_FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        Accept: accept,
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: STOCK_SEARCH_REVALIDATE_SECONDS },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchYahooQuoteMeta(yahooSymbol: string) {
  const url = new URL(`${YAHOO_CHART_BASE_URL}/${encodeURIComponent(yahooSymbol)}`);

  url.searchParams.set("range", "1d");
  url.searchParams.set("interval", "1d");

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Yahoo quote meta request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as YahooChartResponse;
  const meta = data.chart?.result?.[0]?.meta;

  if (!meta) return null;

  return {
    currency: normalizeText(meta.currency).toUpperCase(),
    exchangeName: normalizeText(meta.fullExchangeName) || normalizeText(meta.exchangeName),
    instrumentType: normalizeText(meta.instrumentType).toUpperCase(),
    longName: normalizeText(meta.longName),
    market: normalizeText(meta.exchangeName).toUpperCase(),
    shortName: normalizeText(meta.shortName),
    symbol: normalizeText(meta.symbol).toUpperCase(),
  };
}

async function toStockOption(quote: YahooSearchQuote): Promise<StockOption | null> {
  const yahooSymbol = normalizeText(quote.symbol).toUpperCase();
  const quoteType = normalizeText(quote.quoteType).toUpperCase();

  if (!yahooSymbol || !SUPPORTED_QUOTE_TYPES.has(quoteType)) return null;

  try {
    const meta = await fetchYahooQuoteMeta(yahooSymbol);

    if (!meta?.currency) return null;
    if (meta.instrumentType && !SUPPORTED_QUOTE_TYPES.has(meta.instrumentType)) return null;

    return {
      symbol: meta.symbol || yahooSymbol,
      name:
        meta.longName ||
        normalizeText(quote.longname) ||
        meta.shortName ||
        normalizeText(quote.shortname) ||
        yahooSymbol,
      market: meta.market || normalizeText(quote.exchange).toUpperCase(),
      currency: meta.currency,
      exchangeName: meta.exchangeName || normalizeText(quote.exchDisp),
      yahooSymbol,
    };
  } catch (error) {
    console.error(`Failed to fetch Yahoo quote meta for ${yahooSymbol}. ${getErrorSummary(error)}`);

    return null;
  }
}

export async function searchStockOptions(query: string, limit = 12): Promise<StockOption[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) return [];

  try {
    const url = new URL(YAHOO_SEARCH_URL);

    url.searchParams.set("q", normalizedQuery);
    url.searchParams.set("quotesCount", String(limit));
    url.searchParams.set("newsCount", "0");
    url.searchParams.set("listsCount", "0");

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Yahoo stock search request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as YahooSearchResponse;
    const quotes = Array.isArray(data.quotes) ? data.quotes : [];
    const options = await Promise.all(
      quotes.map(quote => toStockOption(quote as YahooSearchQuote))
    );
    const uniqueOptions = new Map<string, StockOption>();

    options.forEach(option => {
      if (option) {
        uniqueOptions.set(option.yahooSymbol, option);
      }
    });

    return Array.from(uniqueOptions.values());
  } catch (error) {
    console.error(`Failed to search stock options. ${getErrorSummary(error)}`);

    return [];
  }
}

export async function findStockOption(input: {
  symbol: string;
  market: string;
  currency: string;
  yahooSymbol: string;
}) {
  const meta = await fetchYahooQuoteMeta(input.yahooSymbol);

  if (!meta) return null;

  const symbol = meta.symbol || input.yahooSymbol;
  const market = meta.market;

  if (
    symbol !== input.symbol ||
    market !== input.market ||
    meta.currency !== input.currency ||
    input.yahooSymbol !== symbol
  ) {
    return null;
  }

  return {
    symbol,
    name: meta.longName || meta.shortName || symbol,
    market,
    currency: meta.currency,
    exchangeName: meta.exchangeName,
    yahooSymbol: symbol,
  } satisfies StockOption;
}
