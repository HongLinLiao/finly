import { redirect } from "next/navigation";

import { environment } from "@/lib/environment";

export default function LoginPage() {
  return redirect(
    `${environment.lineAccessApi}/authorize?response_type=code&client_id=${environment.lineLoginChannelId}&redirect_uri=${encodeURIComponent(environment.lineRedirectUri)}&scope=profile%20openid%20email&state=${crypto.randomUUID()}`
  );
}
