import type { AccountStatus, CurrencyCode, Timestamp } from "./common";

export interface BrokerageAccount {
  /** 證券戶唯一識別碼 */
  id: string;
  /** 所屬使用者 UID（對應 User.uid） */
  user_uid: string;
  /** 證券商名稱，例如 元大、富邦 */
  broker_name: string;
  /** 證券戶號（可為遮罩格式） */
  account_no?: string;
  /** 帳戶顯示名稱，例如「元大主戶」 */
  account_name: string;
  /** 帳戶狀態 */
  status: AccountStatus;
  /** 基準幣別（ISO 4217，例如 TWD、USD、JPY） */
  base_currency?: CurrencyCode;
  /** 建立時間（Unix timestamp） */
  created_at: Timestamp;
  /** 更新時間（Unix timestamp） */
  updated_at: Timestamp;
}
