import type { AccountStatus, Timestamp } from "./common";

export interface BrokerageAccount {
  /** 證券戶唯一識別碼 */
  id: string;
  /** 證券商名稱，例如 元大、富邦 */
  brokerName: string;
  /** 證券戶號（可為遮罩格式） */
  accountNo: string;
  /** 帳戶顯示名稱，例如「元大主戶」 */
  accountName?: string;
  /** 帳戶狀態 */
  status?: AccountStatus;
  /** 基準幣別 */
  baseCurrency: string;
  /** 建立時間（Unix timestamp） */
  createdAt?: Timestamp;
  /** 更新時間（Unix timestamp） */
  updatedAt?: Timestamp;
}
