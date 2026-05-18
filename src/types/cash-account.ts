import type { AccountStatus, AssetKind, CurrencyCode, Timestamp } from "./common";

/** 資金異動方向 */
export type CashMovementDirection =
  /** 入帳 */
  | "in"
  /** 出帳 */
  | "out";

/** 資金異動方式 */
export type CashMovementMethod =
  /** 約定帳戶或銀行轉入 */
  | "transfer-in"
  /** 轉出到約定帳戶或銀行 */
  | "transfer-out"
  /** 買進股票交割扣款 */
  | "stock-buy-settlement"
  /** 賣出股票交割入帳 */
  | "stock-sell-settlement"
  /** 基金申購扣款 */
  | "fund-subscribe-settlement"
  /** 基金贖回入帳 */
  | "fund-redeem-settlement"
  /** 基金轉入扣款（如有價差補款） */
  | "fund-switch-in-settlement"
  /** 基金轉出入帳（如有差額退回） */
  | "fund-switch-out-settlement"
  /** 手續費扣款 */
  | "fee"
  /** 稅款扣款 */
  | "tax"
  /** 配息入帳（股票或基金） */
  | "dividend"
  /** 利息入帳 */
  | "interest"
  /** 匯兌（同證券戶台外幣互轉） */
  | "fx-exchange";

export interface SecuritiesCashAccount {
  /** 資金帳戶唯一識別碼 */
  id: string;
  /** 所屬使用者 UID（對應 User.uid） */
  user_uid: string;
  /** 所屬證券戶識別碼（對應 BrokerageAccount.id） */
  brokerage_account_id: string;
  /** 幣別，例如 TWD、USD、JPY */
  currency: CurrencyCode;
  /** 帳戶顯示名稱，例如「元大台幣交割戶」 */
  account_name?: string;
  /** 帳戶狀態 */
  status: AccountStatus;
  /** 建立時間（Unix timestamp） */
  created_at: Timestamp;
  /** 更新時間（Unix timestamp） */
  updated_at: Timestamp;
}

export interface CashAccountMovement {
  /** 異動唯一識別碼 */
  id: string;
  /** 所屬使用者 UID（對應 User.uid） */
  user_uid: string;
  /** 所屬證券戶識別碼（對應 BrokerageAccount.id） */
  brokerage_account_id: string;
  /** 所屬資金帳戶識別碼（對應 SecuritiesCashAccount.id） */
  cash_account_id: string;
  /** 異動時間（Unix timestamp） */
  occurred_at: Timestamp;
  /** 異動方向 */
  direction: CashMovementDirection;
  /** 異動方式 */
  method: CashMovementMethod;
  /** 異動金額（永遠填正數） */
  amount: number;
  /** 幣別，例如 TWD、USD */
  currency: CurrencyCode;
  /** 異動後餘額（可選，若有對帳需求可紀錄） */
  balance_after?: number;
  /** 關聯資產類型（股票或基金） */
  related_asset_type?: AssetKind;
  /** 關聯股票交易 ID（對應 StockTransaction.id） */
  stock_transaction_id?: string;
  /** 關聯基金交易 ID（對應 FundTransaction.id） */
  fund_transaction_id?: string;
  /** 關聯標的代號（股票 symbol 或基金 fundCode） */
  related_asset_code?: string;
  /** 備註 */
  note?: string;
  /** 建立時間（Unix timestamp） */
  created_at: Timestamp;
  /** 更新時間（Unix timestamp） */
  updated_at: Timestamp;
}

/** 資金帳戶與異動明細 */
export interface CashAccountLedger {
  cash_account: SecuritiesCashAccount;
  movements: CashAccountMovement[];
}
