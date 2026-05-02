import type { Timestamp } from "./common";

export type LoginProvider = "LINE";

export interface User {
  uid: string;
  username: string;
  email?: string;
  avatar_url?: string;
  provider: LoginProvider;
  provider_user_id?: string;
  created_at: Timestamp;
}
