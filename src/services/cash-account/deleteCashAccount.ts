"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeOptionalText } from "@/lib/form";
import deleteCashAccountRecord from "@/lib/supabase/cash-account/deleteCashAccount";

export type DeleteCashAccountState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: DeleteCashAccountState = {
  success: false,
  message: "",
};

export async function deleteCashAccount(
  _previousState: DeleteCashAccountState,
  formData: FormData
): Promise<DeleteCashAccountState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "登入狀態已失效，請重新登入。",
    };
  }

  const id = normalizeOptionalText(formData.get("id"));

  if (!id) {
    return {
      ...INITIAL_ERROR_STATE,
      message: "找不到要刪除的資金戶。",
    };
  }

  try {
    await deleteCashAccountRecord({
      id,
      userUid: user.uid,
    });
  } catch (error) {
    console.error("Failed to delete cash account:", error);

    return {
      ...INITIAL_ERROR_STATE,
      message: "刪除資金戶失敗，請稍後再試。",
    };
  }

  revalidatePath("/brokerages");

  return {
    success: true,
    message: "已刪除資金戶。",
  };
}
