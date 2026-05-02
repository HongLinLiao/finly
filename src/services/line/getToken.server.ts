import { environment } from "@/lib/environment";
import { fetchWithResult } from "@/lib/fetch";
import { LineTokenResponse } from "@/types";

const { lineLoginChannelId, lineLoginChannelSecret, lineRedirectUri, lineApi } = environment;

export default async function getToken(code: string) {
  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: lineRedirectUri,
    client_id: lineLoginChannelId,
    client_secret: lineLoginChannelSecret,
  });

  return await fetchWithResult<LineTokenResponse>(`${lineApi}/oauth2/v2.1/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenBody.toString(),
    cache: "no-store",
  });
}
