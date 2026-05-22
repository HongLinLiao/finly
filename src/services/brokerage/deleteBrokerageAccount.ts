"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeOptionalText } from "@/lib/form";
import deleteBrokerageAccountRecord from "@/lib/supabase/brokerage/deleteBrokerageAccount";

export type DeleteBrokerageAccountState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: DeleteBrokerageAccountState = {
  success: false,
  message: "",
};

export async function deleteBrokerageAccount(
  _previousState: DeleteBrokerageAccountState,
  formData: FormData
): Promise<DeleteBrokerageAccountState> {
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
      message: "找不到要刪除的證券戶。",
    };
  }

  try {
    await deleteBrokerageAccountRecord({
      id,
      userUid: user.uid,
    });
  } catch (error) {
    console.error("Failed to delete brokerage account:", error);

    return {
      ...INITIAL_ERROR_STATE,
      message: "刪除證券戶失敗，請稍後再試。",
    };
  }

  revalidatePath("/brokerages");

  return {
    success: true,
    message: "已刪除證券戶。",
  };
}
