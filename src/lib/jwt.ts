import { SignJWT, jwtVerify } from "jose";

import { LoginProvider } from "@/types";

import { environment } from "./environment";

export type JwtPayload = {
  iat: number;
  exp: number;
  sub: string;
  uid: string;
  username: string;
  email?: string;
  provider: LoginProvider;
  avatar_url?: string;
};

const { jwtSecret } = environment;

const secret = new TextEncoder().encode(jwtSecret);

export async function encodeToken(data: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function decodeToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch (error) {
    return null;
  }
}
