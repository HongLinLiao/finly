import type { BrokerageAccount } from "./account";
import type { AssetKind, Timestamp, TradeSide } from "./common";
import type { DividendMode, FundTransactionType } from "./fund";
import type { BoardLotType } from "./stock";

export interface BaseTransaction {
  /** 每筆交易唯一識別碼 */
  id: string;
  /** 資產類型：股票或基金 */
  assetType: AssetKind;
  /** 證券戶識別碼（對應 BrokerageAccount.id） */
  accountId: string;
  /** 交易日期（Unix timestamp） */
  tradeDate: Timestamp;
  /** 交割日期（Unix timestamp） */
  settleDate?: Timestamp;
  /** 買進或賣出 */
  side: TradeSide;
  /** 交易數量（股票股數 / 基金單位數） */
  quantity: number;
  /** 每單位價格（股票成交價 / 基金淨值） */
  unitPrice: number;
  /** 原始成交金額（未扣手續費與稅） */
  grossAmount: number;
  /** 手續費 */
  fee?: number;
  /** 稅額（股票常見） */
  tax?: number;
  /** 實際扣款或入帳金額 */
  netAmount: number;
  /** 幣別，例如 TWD、USD */
  currency: string;
  /** 備註 */
  note?: string;
  /** 建立時間（Unix timestamp） */
  createdAt?: Timestamp;
  /** 更新時間（Unix timestamp） */
  updatedAt?: Timestamp;
}

export interface StockTransaction extends BaseTransaction {
  /** 固定為 stock，供型別判斷使用 */
  assetType: "stock";
  /** 股票代號 */
  symbol: string;
  /** 交易市場，例如 TWSE、NASDAQ */
  market?: string;
  /** 零股或整股 */
  boardLotType?: BoardLotType;
}

export interface FundTransaction extends BaseTransaction {
  /** 固定為 fund，供型別判斷使用 */
  assetType: "fund";
  /** 基金代碼 */
  fundCode: string;
  /** 淨值日（Unix timestamp） */
  navDate?: Timestamp;
  /** 申購 / 贖回 / 轉入 / 轉出 */
  transactionType?: FundTransactionType;
  /** 配息方式：領現金或再投入 */
  dividendMode?: DividendMode;
}

/** 股票與基金交易的統一型別 */
export type AssetTransaction = StockTransaction | FundTransaction;

/** 依證券戶分組後的交易紀錄 */
export interface AccountTransactionLedger {
  account: BrokerageAccount;
  transactions: AssetTransaction[];
}
