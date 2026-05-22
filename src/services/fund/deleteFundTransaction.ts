"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeOptionalText } from "@/lib/form";
import deleteFundTransactionRecord from "@/lib/supabase/fund/deleteFundTransaction";

export type DeleteFundTransactionState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: DeleteFundTransactionState = {
  success: false,
  message: "",
};

export async function deleteFundTransaction(
  _previousState: DeleteFundTransactionState,
  formData: FormData
): Promise<DeleteFundTransactionState> {
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
      message: "找不到要刪除的基金交易。",
    };
  }

  try {
    await deleteFundTransactionRecord({
      id,
      userUid: user.uid,
    });
  } catch (error) {
    console.error("Failed to delete fund transaction:", error);

    return {
      ...INITIAL_ERROR_STATE,
      message: "刪除基金交易失敗，請稍後再試。",
    };
  }

  revalidatePath("/funds");

  return {
    success: true,
    message: "已刪除基金交易。",
  };
}
