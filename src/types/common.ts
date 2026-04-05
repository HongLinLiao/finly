/** 資產類型 */
export type AssetKind =
  /** 股票 */
  | "stock"
  /** 基金 */
  | "fund";

/** 交易方向 */
export type TradeSide =
  /** 買進 */
  | "buy"
  /** 賣出 */
  | "sell";

/** 證券戶狀態 */
export type AccountStatus =
  /** 啟用中 */
  | "active"
  /** 暫停使用 */
  | "inactive"
  /** 已結清/關閉 */
  | "closed";

/** Unix timestamp（number） */
export type Timestamp = number;
