"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  normalizeCurrency,
  normalizeDate,
  normalizeNumber,
  normalizeOptionalText,
} from "@/lib/form";
import { findStockOption } from "@/lib/stock-options";
import createStockTransactionRecord from "@/lib/supabase/stock/createStockTransaction";
import { calculateGrossAmount, calculateNetAmount } from "@/lib/transaction-amounts";

import type { TradeSide } from "@/types";

export type CreateStockTransactionState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: CreateStockTransactionState = {
  success: false,
  message: "",
};

export async function createStockTransaction(
  _previousState: CreateStockTransactionState,
  formData: FormData
): Promise<CreateStockTransactionState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "登入狀態已失效，請重新登入。",
    };
  }

  const accountId = normalizeOptionalText(formData.get("accountId"));
  const cashAccountId = normalizeOptionalText(formData.get("cashAccountId"));
  const symbol = normalizeOptionalText(formData.get("symbol"))?.toUpperCase() ?? null;
  const market = normalizeOptionalText(formData.get("market"))?.toUpperCase() ?? null;
  const yahooSymbol = normalizeOptionalText(formData.get("yahooSymbol"))?.toUpperCase() ?? null;
  const side = normalizeOptionalText(formData.get("side")) as TradeSide | null;
  const tradeDate = normalizeDate(formData.get("tradeDate"));
  const quantity = normalizeNumber(formData.get("quantity"));
  const unitPrice = normalizeNumber(formData.get("unitPrice"));
  const grossAmountInput = normalizeNumber(formData.get("grossAmount"));
  const fee = normalizeNumber(formData.get("fee"));
  const tax = normalizeNumber(formData.get("tax"));
  const netAmountInput = normalizeNumber(formData.get("netAmount"));
  const cashSettlementAmountInput = normalizeNumber(formData.get("cashSettlementAmount"));
  const currency = normalizeCurrency(formData.get("currency"));
  const note = normalizeOptionalText(formData.get("note"));

  if (
    !accountId ||
    !cashAccountId ||
    !symbol ||
    !market ||
    !yahooSymbol ||
    !tradeDate ||
    !side ||
    !quantity ||
    unitPrice === null ||
    !currency
  ) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "請填寫資金戶、股票標的、交易日期、數量、單價與幣別。",
    };
  }

  if (side !== "buy" && side !== "sell") {
    return {
      ...INITIAL_ERROR_STATE,
      message: "交易方向不正確。",
    };
  }

  if (currency === "INVALID") {
    return {
      ...INITIAL_ERROR_STATE,
      message: "幣別格式不正確。",
    };
  }

  const stockOption = await findStockOption({
    symbol,
    market,
    currency,
    yahooSymbol,
  });

  if (!stockOption) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "股票標的資料不正確，請重新選擇股票。",
    };
  }

  if (quantity <= 0 || unitPrice < 0 || (fee !== null && fee < 0) || (tax !== null && tax < 0)) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "數量、單價與費用不可為負數。",
    };
  }

  const grossAmount = grossAmountInput ?? calculateGrossAmount(quantity, unitPrice);
  const netAmount = netAmountInput ?? calculateNetAmount(side, grossAmount, fee, tax);

  if (cashSettlementAmountInput !== null && cashSettlementAmountInput <= 0) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "資金戶扣款或入帳金額必須大於 0。",
    };
  }

  try {
    await createStockTransactionRecord({
      userUid: user.uid,
      accountId,
      cashAccountId,
      symbol,
      market,
      tradeDate,
      side,
      quantity,
      unitPrice,
      grossAmount: grossAmountInput,
      fee,
      tax,
      netAmount: netAmountInput,
      effectiveNetAmount: netAmount,
      currency,
      cashSettlementAmount: cashSettlementAmountInput,
      note,
    });
  } catch (error) {
    console.error("Failed to create stock transaction:", error);

    return {
      ...INITIAL_ERROR_STATE,
      message: "新增股票交易失敗，請稍後再試。",
    };
  }

  revalidatePath("/stocks");
  revalidatePath("/brokerages/records");
  revalidatePath("/");

  return {
    success: true,
    message: "已新增股票交易。",
  };
}
