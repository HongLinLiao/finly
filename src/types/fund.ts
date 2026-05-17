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
  /** 累積型（不發放現金配息，收益反映在淨值） */
  | "accumulation"
  /** 現金配息（未指定頻率） */
  | "cash"
  /** 月配息 */
  | "cash-monthly"
  /** 季配息 */
  | "cash-quarterly"
  /** 半年配息 */
  | "cash-semiannual"
  /** 年配息 */
  | "cash-annual"
  /** 其他週期配息 */
  | "cash-irregular"
  /** 配息再投入 */
  | "reinvest";

export const DIVIDEND_MODE_OPTIONS = [
  {
    value: "accumulation",
    label: "累積型 / 不配息",
  },
  {
    value: "cash",
    label: "現金配息（未指定頻率）",
  },
  {
    value: "cash-monthly",
    label: "月配息",
  },
  {
    value: "cash-quarterly",
    label: "季配息",
  },
  {
    value: "cash-semiannual",
    label: "半年配息",
  },
  {
    value: "cash-annual",
    label: "年配息",
  },
  {
    value: "cash-irregular",
    label: "其他週期配息",
  },
  {
    value: "reinvest",
    label: "配息再投入",
  },
] as const satisfies ReadonlyArray<{
  value: DividendMode;
  label: string;
}>;

export function getDividendModeLabel(value: DividendMode | null | undefined) {
  return DIVIDEND_MODE_OPTIONS.find(option => option.value === value)?.label ?? "未指定";
}

export function isDividendMode(value: unknown): value is DividendMode {
  return DIVIDEND_MODE_OPTIONS.some(option => option.value === value);
}
