export interface StockPosition {
  key: string;
  symbol: string;
  market?: string;
  currency: string;
  quantity: number;
  costAmount: number;
  latestClose: number | null;
  priceDate?: string;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedReturnRate: number;
}
