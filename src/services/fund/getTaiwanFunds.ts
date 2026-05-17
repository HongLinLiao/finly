import { fetchCnyesFundOptions } from "@/lib/cnyes-fund";

async function getTaiwanFunds() {
  return fetchCnyesFundOptions();
}

export default getTaiwanFunds;
