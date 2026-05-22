"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeOptionalText } from "@/lib/form";
import deleteStockTransactionRecord from "@/lib/supabase/stock/deleteStockTransaction";

export type DeleteStockTransactionState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: DeleteStockTransactionState = {
  success: false,
  message: "",
};

export async function deleteStockTransaction(
  _previousState: DeleteStockTransactionState,
  formData: FormData
): Promise<DeleteStockTransactionState> {
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
      message: "找不到要刪除的股票交易。",
    };
  }

  try {
    await deleteStockTransactionRecord({
      id,
      userUid: user.uid,
    });
  } catch (error) {
    console.error("Failed to delete stock transaction:", error);

    return {
      ...INITIAL_ERROR_STATE,
      message: "刪除股票交易失敗，請稍後再試。",
    };
  }

  revalidatePath("/stocks");

  return {
    success: true,
    message: "已刪除股票交易。",
  };
}
