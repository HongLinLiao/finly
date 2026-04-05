import type { CashAccountKind, SecuritiesCashAccount, Timestamp } from "@/types";

export interface OverviewCashAccount extends SecuritiesCashAccount {
  balance: number;
  available: number;
  pending: number;
}

export interface AssetValueItem {
  code: string;
  name: string;
  marketValue: number;
  cost: number;
  currency: string;
  accountValues: {
    accountId: string;
    accountName: string;
    marketValue: number;
  }[];
}

export interface DashboardOverviewMock {
  userName: string;
  asOf: Timestamp;
  cashAccounts: OverviewCashAccount[];
  stockValues: AssetValueItem[];
  fundValues: AssetValueItem[];
}

function createCashAccount(
  id: string,
  brokerageAccountId: string,
  kind: CashAccountKind,
  currency: string,
  accountName: string,
  balance: number,
  available: number,
  pending: number
): OverviewCashAccount {
  return {
    id,
    brokerageAccountId,
    kind,
    currency,
    accountName,
    balance,
    available,
    pending,
    status: "active",
    createdAt: 1743091200,
    updatedAt: 1775347200,
  };
}

export const dashboardOverviewMock: DashboardOverviewMock = {
  userName: "Alex",
  asOf: 1775347200,
  cashAccounts: [
    createCashAccount(
      "cash-1",
      "broker-1",
      "twd",
      "TWD",
      "永豐證券｜台幣交割戶",
      248650,
      243100,
      5550
    ),
    createCashAccount(
      "cash-2",
      "broker-1",
      "foreign",
      "USD",
      "永豐證券｜美金交割戶",
      12680,
      11940,
      740
    ),
    createCashAccount(
      "cash-3",
      "broker-2",
      "twd",
      "TWD",
      "富邦證券｜台幣交割戶",
      98210,
      96540,
      1670
    ),
    createCashAccount(
      "cash-4",
      "broker-2",
      "foreign",
      "JPY",
      "富邦證券｜日圓交割戶",
      532000,
      526800,
      5200
    ),
  ],
  stockValues: [
    {
      code: "2330",
      name: "台積電",
      marketValue: 324000,
      cost: 286500,
      currency: "TWD",
      accountValues: [
        { accountId: "broker-1", accountName: "永豐證券", marketValue: 194000 },
        { accountId: "broker-2", accountName: "富邦證券", marketValue: 130000 },
      ],
    },
    {
      code: "0050",
      name: "元大台灣50",
      marketValue: 142500,
      cost: 133300,
      currency: "TWD",
      accountValues: [
        { accountId: "broker-1", accountName: "永豐證券", marketValue: 88500 },
        { accountId: "broker-2", accountName: "富邦證券", marketValue: 54000 },
      ],
    },
    {
      code: "AAPL",
      name: "Apple",
      marketValue: 12860,
      cost: 11200,
      currency: "USD",
      accountValues: [
        { accountId: "broker-1", accountName: "永豐證券", marketValue: 7040 },
        { accountId: "broker-2", accountName: "富邦證券", marketValue: 5820 },
      ],
    },
    {
      code: "MSFT",
      name: "Microsoft",
      marketValue: 9840,
      cost: 9200,
      currency: "USD",
      accountValues: [
        { accountId: "broker-1", accountName: "永豐證券", marketValue: 6020 },
        { accountId: "broker-2", accountName: "富邦證券", marketValue: 3820 },
      ],
    },
  ],
  fundValues: [
    {
      code: "MFG-001",
      name: "貝萊德世界科技基金",
      marketValue: 218300,
      cost: 201000,
      currency: "TWD",
      accountValues: [
        { accountId: "broker-1", accountName: "永豐證券", marketValue: 128300 },
        { accountId: "broker-2", accountName: "富邦證券", marketValue: 90000 },
      ],
    },
    {
      code: "MFG-021",
      name: "安聯收益成長基金",
      marketValue: 186200,
      cost: 179500,
      currency: "TWD",
      accountValues: [
        { accountId: "broker-1", accountName: "永豐證券", marketValue: 76200 },
        { accountId: "broker-2", accountName: "富邦證券", marketValue: 110000 },
      ],
    },
    {
      code: "MFG-088",
      name: "富蘭克林新興國家固定收益",
      marketValue: 9120,
      cost: 9700,
      currency: "USD",
      accountValues: [
        { accountId: "broker-1", accountName: "永豐證券", marketValue: 3120 },
        { accountId: "broker-2", accountName: "富邦證券", marketValue: 6000 },
      ],
    },
    {
      code: "MFG-103",
      name: "摩根士丹利環球機會",
      marketValue: 7540,
      cost: 6800,
      currency: "USD",
      accountValues: [
        { accountId: "broker-1", accountName: "永豐證券", marketValue: 4540 },
        { accountId: "broker-2", accountName: "富邦證券", marketValue: 3000 },
      ],
    },
  ],
};
