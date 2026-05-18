import getCashAccountMovementRecords from "@/lib/supabase/cash-account/getCashAccountMovements";

async function getCashAccountMovements(userUid: string) {
  return getCashAccountMovementRecords(userUid);
}

export default getCashAccountMovements;
