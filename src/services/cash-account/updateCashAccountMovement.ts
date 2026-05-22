"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeCurrency, normalizeNumber, normalizeOptionalText } from "@/lib/form";
import updateCashAccountMovementRecord from "@/lib/supabase/cash-account/updateCashAccountMovement";

import type { AssetKind, CashMovementDirection, CashMovementMethod } from "@/types";

export type UpdateCashAccountMovementState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: UpdateCashAccountMovementState = {
  success: false,
  message: "",
};

const DIRECTIONS = new Set<CashMovementDirection>(["in", "out"]);
const METHODS = new Set<CashMovementMethod>([
  "transfer-in",
  "transfer-out",
  "stock-buy-settlement",
  "stock-sell-settlement",
  "fund-subscribe-settlement",
  "fund-redeem-settlement",
  "fund-switch-in-settlement",
  "fund-switch-out-settlement",
  "fee",
  "tax",
  "dividend",
  "interest",
  "fx-exchange",
]);
const ASSET_TYPES = new Set<AssetKind>(["stock", "fund"]);

function normalizeDateTime(
  dateValue: FormDataEntryValue | null,
  timeValue: FormDataEntryValue | null
) {
  const date = normalizeOptionalText(dateValue);
  const time = normalizeOptionalText(timeValue) ?? "00:00";

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;

  const parsed = new Date(`${date}T${time}:00.000+08:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeDirection(value: FormDataEntryValue | null) {
  const text = normalizeOptionalText(value);

  return text && DIRECTIONS.has(text as CashMovementDirection)
    ? (text as CashMovementDirection)
    : null;
}

function normalizeMethod(value: FormDataEntryValue | null) {
  const text = normalizeOptionalText(value);

  return text && METHODS.has(text as CashMovementMethod) ? (text as CashMovementMethod) : null;
}

function normalizeAssetType(value: FormDataEntryValue | null): AssetKind | null | "INVALID" {
  const text = normalizeOptionalText(value);

  if (!text || text === "none") return null;

  return ASSET_TYPES.has(text as AssetKind) ? (text as AssetKind) : "INVALID";
}

export async function updateCashAccountMovement(
  _previousState: UpdateCashAccountMovementState,
  formData: FormData
): Promise<UpdateCashAccountMovementState> {
  const user = await getCurrentUser();

  if (!user) {
    return { ...INITIAL_ERROR_STATE, message: "登入狀態已失效，請重新登入。" };
  }

  const id = normalizeOptionalText(formData.get("id"));
  const brokerageAccountId = normalizeOptionalText(formData.get("brokerageAccountId"));
  const cashAccountId = normalizeOptionalText(formData.get("cashAccountId"));
  const occurredAt = normalizeDateTime(formData.get("occurredDate"), formData.get("occurredTime"));
  const direction = normalizeDirection(formData.get("direction"));
  const method = normalizeMethod(formData.get("method"));
  const amount = normalizeNumber(formData.get("amount"));
  const currency = normalizeCurrency(formData.get("currency"));
  const balanceAfter = normalizeNumber(formData.get("balanceAfter"));
  const relatedAssetType = normalizeAssetType(formData.get("relatedAssetType"));
  const relatedAssetCode = normalizeOptionalText(formData.get("relatedAssetCode"));
  const note = normalizeOptionalText(formData.get("note"));

  if (
    !id ||
    !brokerageAccountId ||
    !cashAccountId ||
    !occurredAt ||
    !direction ||
    !method ||
    amount === null ||
    !currency
  ) {
    return { ...INITIAL_ERROR_STATE, message: "請填寫日期、資金戶、方向、方式、金額與幣別。" };
  }

  if (currency === "INVALID") {
    return { ...INITIAL_ERROR_STATE, message: "幣別格式不正確。" };
  }

  if (relatedAssetType === "INVALID") {
    return { ...INITIAL_ERROR_STATE, message: "關聯資產類型不正確。" };
  }

  if (amount <= 0 || (balanceAfter !== null && balanceAfter < 0)) {
    return { ...INITIAL_ERROR_STATE, message: "金額必須大於 0，異動後餘額不可為負數。" };
  }

  try {
    await updateCashAccountMovementRecord({
      id,
      userUid: user.uid,
      brokerageAccountId,
      cashAccountId,
      occurredAt,
      direction,
      method,
      amount,
      currency,
      balanceAfter,
      relatedAssetType,
      relatedAssetCode,
      note,
    });
  } catch (error) {
    console.error("Failed to update cash account movement:", error);

    return { ...INITIAL_ERROR_STATE, message: "更新資金異動失敗，請稍後再試。" };
  }

  revalidatePath("/brokerages/records");
  revalidatePath("/");

  return { success: true, message: "已更新資金異動。" };
}
