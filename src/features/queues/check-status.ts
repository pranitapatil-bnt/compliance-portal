import type { CheckStatus } from "./types";

export function parseCheckStatus(value: string | undefined): CheckStatus {
  const normalized =
    value
      ?.trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_") ?? "";
  if (normalized === "PASS") {
    return "pass";
  }
  if (normalized === "NOT_REQUIRED" || normalized === "NOT_PERFORMED") {
    return "na";
  }
  return "fail";
}

export function checkStatusLabel(status: CheckStatus): string {
  if (status === "pass") {
    return "Pass";
  }
  if (status === "na") {
    return "Not required";
  }
  return "Fail";
}
