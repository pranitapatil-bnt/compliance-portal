import "server-only";

import { env } from "@/config/env";

type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, message: string, extra?: unknown): void {
  const entry = {
    level,
    message,
    extra,
    timestamp: new Date().toISOString(),
  };

  if (env.isProduction) {
    console[level](JSON.stringify(entry));
    return;
  }

  console[level](`[${level}] ${message}`, extra ?? "");
}

export const logger = {
  info: (message: string, extra?: unknown) => write("info", message, extra),
  warn: (message: string, extra?: unknown) => write("warn", message, extra),
  error: (message: string, extra?: unknown) => write("error", message, extra),
};
