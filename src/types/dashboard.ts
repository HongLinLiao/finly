import type { SecuritiesCashAccount } from "./cash-account";

export interface OverviewCashAccount extends SecuritiesCashAccount {
  brokerageAccountName: string;
  balance: number;
}

export interface AssetValueItem {
  code: string;
  name: string;
  marketValue: number;
  cost: number;
  unrealizedReturnRate: number;
  currency: string;
  accountValues: {
    accountId: string;
    accountName: string;
    marketValue: number;
  }[];
}
