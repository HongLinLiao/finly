"use client";

import { useRef } from "react";

import { useUser } from "@/hooks/state/use-user";
import { User } from "@/types/user";

interface AuthInitializerProps {
  user: User | null;
}

export function AuthInitializer({ user }: AuthInitializerProps) {
  const initialized = useRef(false);

  // 確保只在 Client 端第一次渲染時同步一次狀態，避免影響 Server 端全域狀態
  if (typeof window !== "undefined" && !initialized.current) {
    useUser.setState({ user });
    initialized.current = true;
  }

  return null;
}
