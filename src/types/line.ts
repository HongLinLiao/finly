export interface LineTokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

export interface LineProfileResponse {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LineIdTokenPayload {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
}
