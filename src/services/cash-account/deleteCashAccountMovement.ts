"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { normalizeOptionalText } from "@/lib/form";
import deleteCashAccountMovementRecord from "@/lib/supabase/cash-account/deleteCashAccountMovement";

export type DeleteCashAccountMovementState = {
  success: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: DeleteCashAccountMovementState = {
  success: false,
  message: "",
};

export async function deleteCashAccountMovement(
  _previousState: DeleteCashAccountMovementState,
  formData: FormData
): Promise<DeleteCashAccountMovementState> {
  const user = await getCurrentUser();

  if (!user) {
    return { ...INITIAL_ERROR_STATE, message: "登入狀態已失效，請重新登入。" };
  }

  const id = normalizeOptionalText(formData.get("id"));

  if (!id) {
    return { ...INITIAL_ERROR_STATE, message: "找不到要刪除的資金異動。" };
  }

  try {
    await deleteCashAccountMovementRecord({ id, userUid: user.uid });
  } catch (error) {
    console.error("Failed to delete cash account movement:", error);

    return { ...INITIAL_ERROR_STATE, message: "刪除資金異動失敗，請稍後再試。" };
  }

  revalidatePath("/brokerages/records");
  revalidatePath("/");

  return { success: true, message: "已刪除資金異動。" };
}
