import getCashAccountMovementRecords from "@/lib/supabase/cash-account/getCashAccountMovements";

interface GetCashAccountMovementsOptions {
  occurredAtFrom?: string;
  occurredAtTo?: string;
}

async function getCashAccountMovements(
  userUid: string,
  options: GetCashAccountMovementsOptions = {}
) {
  return getCashAccountMovementRecords(userUid, options);
}

export default getCashAccountMovements;
