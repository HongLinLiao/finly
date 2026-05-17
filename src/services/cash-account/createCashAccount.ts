"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeCurrency, normalizeOptionalText } from "@/lib/form";
import createCashAccountRecord from "@/lib/supabase/cash-account/createCashAccount";

export type CreateCashAccountState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: CreateCashAccountState = {
  success: false,
  message: "",
};

export async function createCashAccount(
  _previousState: CreateCashAccountState,
  formData: FormData
): Promise<CreateCashAccountState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "登入狀態已失效，請重新登入。",
    };
  }

  const brokerageAccountId = normalizeOptionalText(formData.get("brokerageAccountId"));
  const accountName = normalizeOptionalText(formData.get("accountName"));
  const currency = normalizeCurrency(formData.get("currency"));

  if (!brokerageAccountId || !currency) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "請選擇證券戶與幣別。",
    };
  }

  if (currency === "INVALID") {
    return {
      ...INITIAL_ERROR_STATE,
      message: "幣別格式不正確。",
    };
  }

  try {
    await createCashAccountRecord({
      userUid: user.uid,
      brokerageAccountId,
      currency,
      accountName,
    });
  } catch (error) {
    console.error("Failed to create cash account:", error);

    return {
      ...INITIAL_ERROR_STATE,
      message: "新增資金戶失敗，請稍後再試。",
    };
  }

  revalidatePath("/brokerages");

  return {
    success: true,
    message: "已新增資金戶。",
  };
}
