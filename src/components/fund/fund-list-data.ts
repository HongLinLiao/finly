import type { DividendMode } from "@/types/fund";

export type FundRisk = "RR1" | "RR2" | "RR3" | "RR4" | "RR5";
export type FundCurrency = "TWD" | "USD";

export interface FundPosition {
  id: string;
  name: string;
  symbol: string;
  fundHouse: string;
  risk: FundRisk;
  dividendMode: DividendMode;
  currency: FundCurrency;
  costAmount: number;
  marketValue: number;
  return1m: number;
  return1y: number;
}
