import "server-only";

import { getStockPriceKey } from "@/lib/stock-price";

import type { StockPriceQuote, StockPriceRequest } from "@/lib/stock-price";

interface YahooChartResponse {
  chart?: {
    result?: {
      meta?: {
        currency?: unknown;
        previousClose?: unknown;
        regularMarketPrice?: unknown;
      };
      timestamp?: unknown[];
      indicators?: {
        quote?: {
          close?: unknown[];
        }[];
      };
    }[];
  };
}

const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const YAHOO_FETCH_TIMEOUT_MS = 10_000;

function normalizeNumber(value: unknown) {
  const normalized = typeof value === "number" ? value : Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function normalizeCurrency(value: unknown, fallback?: string) {
  return typeof value === "string" && value ? value.toUpperCase() : (fallback ?? "USD");
}

function normalizeYahooSymbol({ symbol, market, currency }: StockPriceRequest) {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const normalizedMarket = market?.trim().toUpperCase();

  if (!normalizedSymbol || normalizedSymbol.includes(".")) return normalizedSymbol;

  if (["TWSE", "TAI", "TW"].includes(normalizedMarket ?? "")) return `${normalizedSymbol}.TW`;
  if (["TPEX", "TWO", "OTC", "GTSM"].includes(normalizedMarket ?? "")) {
    return `${normalizedSymbol}.TWO`;
  }
  if (["HK", "HKEX", "SEHK"].includes(normalizedMarket ?? "")) {
    return `${normalizedSymbol.padStart(4, "0")}.HK`;
  }
  if (["JP", "JPX", "TYO"].includes(normalizedMarket ?? "")) return `${normalizedSymbol}.T`;
  if (normalizedMarket === "LSE" || normalizedMarket === "LON") return `${normalizedSymbol}.L`;
  if (normalizedMarket === "ASX") return `${normalizedSymbol}.AX`;
  if (normalizedMarket === "TSX") return `${normalizedSymbol}.TO`;
  if (normalizedMarket === "TSXV") return `${normalizedSymbol}.V`;

  if (currency === "TWD" && /^\d{4,6}$/.test(normalizedSymbol)) return `${normalizedSymbol}.TW`;

  return normalizedSymbol;
}

function getLatestClose(data: YahooChartResponse) {
  const result = data.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];

  for (let index = closes.length - 1; index >= 0; index -= 1) {
    const close = normalizeNumber(closes[index]);
    const timestamp = normalizeNumber(timestamps[index]);

    if (close !== null && timestamp) {
      return {
        close,
        priceDate: new Date(timestamp * 1000).toISOString().slice(0, 10),
      };
    }
  }

  const fallbackClose =
    normalizeNumber(result?.meta?.previousClose) ??
    normalizeNumber(result?.meta?.regularMarketPrice);

  return {
    close: fallbackClose,
    priceDate: "",
  };
}

async function fetchYahooStockQuote(request: StockPriceRequest): Promise<StockPriceQuote> {
  const yahooSymbol = normalizeYahooSymbol(request);
  const url = new URL(`${YAHOO_CHART_BASE_URL}/${encodeURIComponent(yahooSymbol)}`);

  url.searchParams.set("range", "10d");
  url.searchParams.set("interval", "1d");
  url.searchParams.set("includePrePost", "false");
  url.searchParams.set("events", "div,splits");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), YAHOO_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: 12 * 60 * 60 },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as YahooChartResponse;
    const latest = getLatestClose(data);
    const currency = normalizeCurrency(data.chart?.result?.[0]?.meta?.currency, request.currency);

    return {
      ...request,
      key: getStockPriceKey(request),
      yahooSymbol,
      close: latest.close,
      currency,
      priceDate: latest.priceDate,
      source: "yahoo",
    };
  } catch (error) {
    console.error(`Failed to fetch Yahoo Finance quote for ${yahooSymbol}.`, error);

    return {
      ...request,
      key: getStockPriceKey(request),
      yahooSymbol,
      close: null,
      currency: request.currency ?? "USD",
      priceDate: "",
      source: "yahoo",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchYahooStockQuotes(requests: StockPriceRequest[]) {
  const uniqueRequests = Array.from(
    new Map(requests.map(request => [getStockPriceKey(request), request])).values()
  );

  return Promise.all(uniqueRequests.map(fetchYahooStockQuote));
}
