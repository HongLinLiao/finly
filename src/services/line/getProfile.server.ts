import { environment } from "@/lib/environment";
import { fetchWithResult } from "@/lib/fetch";
import { LineProfileResponse } from "@/types";

const { lineApi } = environment;

export default async function getProfile(accessToken: string) {
  return await fetchWithResult<LineProfileResponse>(`${lineApi}/v2/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
}
