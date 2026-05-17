import type { BrokerageAccount } from "./account";
import type { CurrencyCode, Timestamp, TradeSide } from "./common";
import type { DividendMode, FundTransactionType } from "./fund";
import type { BoardLotType } from "./stock";

export interface BaseTransaction {
  /** 每筆交易唯一識別碼 */
  id: string;
  /** 所屬使用者 UID（對應 User.uid） */
  user_uid: string;
  /** 證券戶識別碼（對應 BrokerageAccount.id） */
  account_id: string;
  /** 交易日期（Unix timestamp） */
  trade_date: Timestamp;
  /** 交割日期（Unix timestamp） */
  settle_date?: Timestamp;
  /** 買進或賣出 */
  side: TradeSide;
  /** 交易數量（股票股數 / 基金單位數） */
  quantity: number;
  /** 每單位價格（股票成交價 / 基金淨值） */
  unit_price: number;
  /** 原始成交金額（未扣手續費與稅） */
  gross_amount: number;
  /** 手續費 */
  fee?: number;
  /** 稅額（股票常見） */
  tax?: number;
  /** 實際扣款或入帳金額 */
  net_amount: number;
  /** 幣別，例如 TWD、USD */
  currency: CurrencyCode;
  /** 備註 */
  note?: string;
  /** 建立時間（Unix timestamp） */
  created_at: Timestamp;
  /** 更新時間（Unix timestamp） */
  updated_at: Timestamp;
}

export interface StockTransaction extends BaseTransaction {
  /** 股票代號 */
  symbol: string;
  /** 交易市場，例如 TWSE、NASDAQ */
  market?: string;
  /** 零股或整股 */
  board_lot_type?: BoardLotType;
}

export interface FundTransaction extends BaseTransaction {
  /** 基金代碼 */
  fund_code: string;
  /** 淨值日（Unix timestamp） */
  nav_date?: Timestamp;
  /** 申購 / 贖回 / 轉入 / 轉出 */
  transaction_type?: FundTransactionType;
  /** 配息方式：累積型、現金配息頻率或配息再投入 */
  dividend_mode?: DividendMode;
}

/** 股票與基金交易的統一型別 */
export type AssetTransaction = StockTransaction | FundTransaction;

/** 依證券戶分組後的交易紀錄 */
export interface AccountTransactionLedger {
  account: BrokerageAccount;
  transactions: AssetTransaction[];
}
