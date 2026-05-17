"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  normalizeCurrency,
  normalizeDate,
  normalizeNumber,
  normalizeOptionalText,
} from "@/lib/form";
import createFundTransactionRecord from "@/lib/supabase/fund/createFundTransaction";
import { isDividendMode } from "@/types/fund";

import type { DividendMode, FundTransactionType, TradeSide } from "@/types";

export type CreateFundTransactionState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: CreateFundTransactionState = {
  success: false,
  message: "",
};

function calculateNetAmount(side: TradeSide, grossAmount: number, fee: number, tax: number) {
  return side === "sell" ? grossAmount - fee - tax : grossAmount + fee + tax;
}

export async function createFundTransaction(
  _previousState: CreateFundTransactionState,
  formData: FormData
): Promise<CreateFundTransactionState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "登入狀態已失效，請重新登入。",
    };
  }

  const accountId = normalizeOptionalText(formData.get("accountId"));
  const fundCode = normalizeOptionalText(formData.get("fundCode"))?.toUpperCase() ?? null;
  const tradeDate = normalizeDate(formData.get("tradeDate"));
  const settleDate = normalizeDate(formData.get("settleDate"));
  const navDate = normalizeDate(formData.get("navDate"));
  const side = normalizeOptionalText(formData.get("side")) as TradeSide | null;
  const transactionType = normalizeOptionalText(
    formData.get("transactionType")
  ) as FundTransactionType | null;
  const dividendMode = normalizeOptionalText(formData.get("dividendMode")) as DividendMode | null;
  const quantity = normalizeNumber(formData.get("quantity"));
  const unitPrice = normalizeNumber(formData.get("unitPrice"));
  const grossAmountInput = normalizeNumber(formData.get("grossAmount"));
  const fee = normalizeNumber(formData.get("fee")) ?? 0;
  const tax = normalizeNumber(formData.get("tax")) ?? 0;
  const netAmountInput = normalizeNumber(formData.get("netAmount"));
  const currency = normalizeCurrency(formData.get("currency"));
  const note = normalizeOptionalText(formData.get("note"));

  if (
    !accountId ||
    !fundCode ||
    !tradeDate ||
    !side ||
    !quantity ||
    unitPrice === null ||
    !currency
  ) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "請填寫基金、資金戶、交易日期、單位數、單位淨值與幣別。",
    };
  }

  if (side !== "buy" && side !== "sell") {
    return {
      ...INITIAL_ERROR_STATE,
      message: "交易方向不正確。",
    };
  }

  if (dividendMode && !isDividendMode(dividendMode)) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "配息方式不正確。",
    };
  }

  if (currency === "INVALID") {
    return {
      ...INITIAL_ERROR_STATE,
      message: "幣別格式不正確。",
    };
  }

  if (quantity <= 0 || unitPrice < 0 || fee < 0 || tax < 0) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "單位數、單位淨值與費用不可為負數。",
    };
  }

  const grossAmount = grossAmountInput ?? quantity * unitPrice;
  const netAmount = netAmountInput ?? calculateNetAmount(side, grossAmount, fee, tax);

  try {
    await createFundTransactionRecord({
      userUid: user.uid,
      accountId,
      fundCode,
      tradeDate,
      settleDate,
      side,
      navDate,
      transactionType,
      dividendMode,
      quantity,
      unitPrice,
      grossAmount,
      fee,
      tax,
      netAmount,
      currency,
      note,
    });
  } catch (error) {
    console.error("Failed to create fund transaction:", error);

    return {
      ...INITIAL_ERROR_STATE,
      message: "新增基金交易失敗，請稍後再試。",
    };
  }

  revalidatePath("/funds");

  return {
    success: true,
    message: "已新增基金交易。",
  };
}
