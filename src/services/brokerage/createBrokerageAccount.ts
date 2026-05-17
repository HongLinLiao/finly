"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeCurrency, normalizeOptionalText } from "@/lib/form";
import createBrokerageAccountRecord from "@/lib/supabase/brokerage/createBrokerageAccount";

export type CreateBrokerageAccountState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: CreateBrokerageAccountState = {
  success: false,
  message: "",
};

export async function createBrokerageAccount(
  _previousState: CreateBrokerageAccountState,
  formData: FormData
): Promise<CreateBrokerageAccountState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "登入狀態已失效，請重新登入。",
    };
  }

  const accountName = normalizeOptionalText(formData.get("accountName"));
  const brokerName = normalizeOptionalText(formData.get("brokerName"));
  const accountNo = normalizeOptionalText(formData.get("accountNo"));
  const baseCurrency = normalizeCurrency(formData.get("baseCurrency"));

  if (!accountName || !brokerName) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "請填寫帳戶名稱與證券商名稱。",
    };
  }

  if (baseCurrency === "INVALID") {
    return {
      ...INITIAL_ERROR_STATE,
      message: "基準幣別請輸入三碼英文代碼，例如 TWD 或 USD。",
    };
  }

  try {
    await createBrokerageAccountRecord({
      userUid: user.uid,
      accountName,
      brokerName,
      accountNo,
      baseCurrency,
    });
  } catch (error) {
    console.error("Failed to create brokerage account:", error);

    return {
      ...INITIAL_ERROR_STATE,
      message: "新增證券戶失敗，請稍後再試。",
    };
  }

  revalidatePath("/brokerages");

  return {
    success: true,
    message: "已新增證券戶。",
  };
}
