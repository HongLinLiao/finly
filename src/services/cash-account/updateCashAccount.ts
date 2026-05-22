"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeOptionalText } from "@/lib/form";
import updateCashAccountRecord from "@/lib/supabase/cash-account/updateCashAccount";

import type { AccountStatus } from "@/types";

export type UpdateCashAccountState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: UpdateCashAccountState = {
  success: false,
  message: "",
};

const ACCOUNT_STATUSES = new Set<AccountStatus>(["active", "inactive", "closed"]);

function normalizeAccountStatus(value: FormDataEntryValue | null) {
  const text = normalizeOptionalText(value);

  return text && ACCOUNT_STATUSES.has(text as AccountStatus) ? (text as AccountStatus) : null;
}

export async function updateCashAccount(
  _previousState: UpdateCashAccountState,
  formData: FormData
): Promise<UpdateCashAccountState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "登入狀態已失效，請重新登入。",
    };
  }

  const id = normalizeOptionalText(formData.get("id"));
  const accountName = normalizeOptionalText(formData.get("accountName"));
  const status = normalizeAccountStatus(formData.get("status"));

  if (!id || !status) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "請選擇帳戶狀態。",
    };
  }

  try {
    await updateCashAccountRecord({
      id,
      userUid: user.uid,
      accountName,
      status,
    });
  } catch (error) {
    console.error("Failed to update cash account:", error);

    return {
      ...INITIAL_ERROR_STATE,
      message: "更新資金戶失敗，請稍後再試。",
    };
  }

  revalidatePath("/brokerages");

  return {
    success: true,
    message: "已更新資金戶。",
  };
}
