import * as React from "react";

import { getCurrentUser } from "@/lib/auth/current-user";

import { AuthInitializer } from "../util/auth-initializer";

export async function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <AuthInitializer user={user} />
      {children}
    </>
  );
}
