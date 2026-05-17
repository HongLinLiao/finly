import { fetchFrankfurterCurrencies } from "@/lib/frankfurter";

async function getCurrencies() {
  return fetchFrankfurterCurrencies();
}

export default getCurrencies;
