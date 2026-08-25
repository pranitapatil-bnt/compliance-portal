import { isRecord, readNumber, readString } from "@/lib/utils/guards";

import type { TxnApiDetailField, TxnApiDetailSection, TxnApiDetails } from "./types";

const SKIP_KEYS = new Set([
  "errorCode",
  "errorMessage",
  "errorDescription",
  "page",
  "user",
]);

const LABELS: Record<string, string> = {
  tradePaymentId: "Payment ID",
  paymentId: "Payment ID",
  transactionId: "Transaction ID",
  contractNumber: "Contract",
  date: "Date",
  contactName: "Client",
  contactId: "Client ID",
  type: "Type",
  organization: "Organization",
  organisation: "Organization",
  org: "Organization",
  amount: "Amount",
  currency: "Currency",
  overallStatus: "Status",
  status: "Status",
  stp: "STP",
  stpFlag: "STP",
  initialStatus: "Initial status",
  blacklist: "Blacklist",
  sanction: "Sanction",
  fraugster: "Fraugster",
  customCheck: "Custom",
  locked: "Locked",
  lockedBy: "Locked by",
};

function labelFromKey(key: string): string {
  if (LABELS[key]) {
    return LABELS[key];
  }
  const spaced = key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatValue(value: unknown): string {
  if (value == null) {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  const text = readString(value)?.trim();
  if (text) {
    return text;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "—";
    }
    if (value.every((item) => item == null || typeof item !== "object")) {
      return value.map((item) => formatValue(item)).join(", ");
    }
    return JSON.stringify(value, null, 2);
  }
  if (isRecord(value)) {
    return JSON.stringify(value, null, 2);
  }
  return "—";
}

function pickText(...values: unknown[]): string {
  for (const value of values) {
    const text = formatValue(value);
    if (text && text !== "—") {
      return text;
    }
  }
  return "";
}

function unwrapRecord(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    return {};
  }
  const nested =
    payload.txnApiDetails ??
    payload.details ??
    payload.transaction ??
    payload.data;
  return isRecord(nested) ? nested : payload;
}

function fieldsFromRecord(record: Record<string, unknown>): TxnApiDetailField[] {
  return Object.entries(record)
    .filter(([key, value]) => {
      if (SKIP_KEYS.has(key) || value == null) {
        return false;
      }
      if (isRecord(value) || Array.isArray(value)) {
        return false;
      }
      return formatValue(value) !== "—";
    })
    .map(([key, value]) => ({
      label: labelFromKey(key),
      value: formatValue(value),
    }));
}

function nestedSections(record: Record<string, unknown>): TxnApiDetailSection[] {
  const sections: TxnApiDetailSection[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (SKIP_KEYS.has(key) || !isRecord(value)) {
      continue;
    }
    const fields = fieldsFromRecord(value);
    if (fields.length > 0) {
      sections.push({ title: labelFromKey(key), fields });
    }
  }
  return sections;
}

function portalError(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }
  return (
    readString(payload.errorMessage) ?? readString(payload.errorDescription)
  );
}

export function parseTxnApiDetails(
  payload: unknown,
  transactionId: string,
  source: "REPORT" | "QUEUE",
): TxnApiDetails {
  const record = unwrapRecord(payload);
  const error = portalError(payload) ?? portalError(record);
  const fields = fieldsFromRecord(record);
  const nested = nestedSections(record);
  const title =
    pickText(
      record.tradePaymentId,
      record.paymentId,
      record.transactionId,
      transactionId,
    ) || transactionId;
  const status = pickText(record.overallStatus, record.status);

  return {
    transactionId:
      pickText(record.transactionId, record.tradePaymentId, transactionId) ||
      transactionId,
    source,
    title,
    status,
    sections: [
      ...(fields.length > 0
        ? [{ title: "Transaction", fields }]
        : []),
      ...nested,
    ],
    error:
      error ||
      (fields.length === 0 && nested.length === 0
        ? "No details were returned for this transaction."
        : undefined),
  };
}

export function txnApiDetailsBody(
  transactionId: string,
  source: "REPORT" | "QUEUE",
): { transactionId: string; source: string; tradePaymentId?: number } {
  const body: {
    transactionId: string;
    source: string;
    tradePaymentId?: number;
  } = { transactionId, source };
  const asNumber = readNumber(transactionId);
  if (asNumber != null && /^\d+$/.test(transactionId.trim())) {
    body.tradePaymentId = asNumber;
  }
  return body;
}
