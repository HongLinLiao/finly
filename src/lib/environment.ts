interface Environment {
  env: "local" | "development" | "production";
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  jwtSecret: string;
  lineAccessApi: string;
  lineApi: string;
  lineLoginChannelId: string;
  lineLoginChannelSecret: string;
  lineRedirectUri: string;
}

export const environment: Environment = {
  env: (process.env.ENV as "local" | "development" | "production") || "local",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "",
  lineAccessApi: process.env.LINE_ACCESS_API || "",
  lineApi: process.env.LINE_API || "",
  lineLoginChannelId: process.env.LINE_LOGIN_CHANNEL_ID || "",
  lineLoginChannelSecret: process.env.LINE_LOGIN_CHANNEL_SECRET || "",
  lineRedirectUri: process.env.LINE_REDIRECT_URI || "",
};
