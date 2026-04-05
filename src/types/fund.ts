/** 基金交易類型 */
export type FundTransactionType =
  /** 申購 */
  | "subscribe"
  /** 贖回 */
  | "redeem"
  /** 轉入 */
  | "switch-in"
  /** 轉出 */
  | "switch-out";

/** 基金配息方式 */
export type DividendMode =
  /** 現金配息 */
  | "cash"
  /** 配息再投入 */
  | "reinvest";
