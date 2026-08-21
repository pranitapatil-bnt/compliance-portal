import "server-only";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiBaseUrl: readEnv("API_BASE_URL"),
  sessionSecret: readEnv("SESSION_SECRET") ?? "dev-only-change-me",
  isProduction: process.env.NODE_ENV === "production",
} as const;
