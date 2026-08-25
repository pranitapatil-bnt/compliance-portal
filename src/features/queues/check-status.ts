import type { CheckStatus } from "./types";

export function parseCheckStatus(value: string | undefined): CheckStatus {
  const normalized =
    value
      ?.trim()
      .toUpperCase()
      .replace(/[\s\-/]+/g, "_") ?? "";
  if (normalized === "PASS") {
    return "pass";
  }
  if (
    normalized === "NOT_REQUIRED" ||
    normalized === "NOT_PERFORMED" ||
    normalized === "NOT_APPLICABLE" ||
    normalized === "NOT_AVAILABLE" ||
    normalized === "NA" ||
    normalized === "N_A" ||
    normalized === "NONE" ||
    normalized === "NULL"
  ) {
    return "na";
  }
  if (
    normalized === "PENDING" ||
    normalized === "IN_PROGRESS" ||
    normalized === "INPROGRESS" ||
    normalized === "PROCESSING" ||
    normalized === "WAIT" ||
    normalized === "WAITING" ||
    normalized === "HOLD"
  ) {
    return "pending";
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
  if (status === "pending") {
    return "Pending";
  }
  return "Fail";
}
