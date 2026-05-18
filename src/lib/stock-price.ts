export interface StockPriceRequest {
  symbol: string;
  market?: string;
  currency?: string;
}

export interface StockPriceQuote extends StockPriceRequest {
  key: string;
  yahooSymbol: string;
  close: number | null;
  currency: string;
  priceDate: string;
  source: "yahoo";
}

export function getStockPriceKey({ symbol, market, currency }: StockPriceRequest) {
  return [symbol.trim().toUpperCase(), market?.trim().toUpperCase() ?? "", currency ?? ""].join(
    "|"
  );
}
