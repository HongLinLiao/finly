"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeOptionalText } from "@/lib/form";
import updateBrokerageAccountRecord from "@/lib/supabase/brokerage/updateBrokerageAccount";

import type { AccountStatus } from "@/types";

export type UpdateBrokerageAccountState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: UpdateBrokerageAccountState = {
  success: false,
  message: "",
};

const ACCOUNT_STATUSES = new Set<AccountStatus>(["active", "inactive", "closed"]);

function normalizeAccountStatus(value: FormDataEntryValue | null) {
  const text = normalizeOptionalText(value);

  return text && ACCOUNT_STATUSES.has(text as AccountStatus) ? (text as AccountStatus) : null;
}

export async function updateBrokerageAccount(
  _previousState: UpdateBrokerageAccountState,
  formData: FormData
): Promise<UpdateBrokerageAccountState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "登入狀態已失效，請重新登入。",
    };
  }

  const id = normalizeOptionalText(formData.get("id"));
  const accountName = normalizeOptionalText(formData.get("accountName"));
  const brokerName = normalizeOptionalText(formData.get("brokerName"));
  const accountNo = normalizeOptionalText(formData.get("accountNo"));
  const status = normalizeAccountStatus(formData.get("status"));

  if (!id || !accountName || !brokerName || !status) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "請填寫帳戶名稱、證券商名稱與帳戶狀態。",
    };
  }

  try {
    await updateBrokerageAccountRecord({
      id,
      userUid: user.uid,
      accountName,
      brokerName,
      accountNo,
      status,
    });
  } catch (error) {
    console.error("Failed to update brokerage account:", error);

    return {
      ...INITIAL_ERROR_STATE,
      message: "更新證券戶失敗，請稍後再試。",
    };
  }

  revalidatePath("/brokerages");

  return {
    success: true,
    message: "已更新證券戶。",
  };
}
