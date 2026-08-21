import {
  asRecordList,
  isRecord,
  readNumber,
  readString,
} from "@/lib/utils/guards";

import type { QueueResult, QueueRow } from "./types";

function cell(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  const text = readString(value)?.trim();
  return text && text.length > 0 ? text : "—";
}

function joinName(row: Record<string, unknown>): string {
  return (
    [
      readString(row.business_name),
      readString(row.companyName),
      [readString(row.first_name), readString(row.last_name)]
        .filter(Boolean)
        .join(" "),
      readString(row.contactName),
      readString(row.beneficiaryName),
    ].find((value) => value && value.trim().length > 0) ?? "—"
  );
}

export function readPageTotal(payload: unknown): number {
  if (!isRecord(payload)) {
    return 0;
  }
  if (isRecord(payload.page)) {
    return readNumber(payload.page.totalRecords) ?? 0;
  }
  return readNumber(payload.totalRecords) ?? 0;
}

function queueError(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }
  return (
    readString(payload.errorMessage) ?? readString(payload.errorDescription)
  );
}

function asQueue(
  payload: unknown,
  rows: QueueRow[],
  fallbackTotal = rows.length,
): QueueResult {
  const error = queueError(payload);
  return {
    rows,
    total: readPageTotal(payload) || fallbackTotal,
    error: error && error.length > 0 ? error : undefined,
  };
}

function idPart(value: unknown): string | undefined {
  const asString = readString(value)?.trim();
  if (asString) {
    return asString;
  }
  const asNumber = readNumber(value);
  return asNumber == null ? undefined : String(asNumber);
}

function rowId(row: Record<string, unknown>, fallback: string): string {
  return (
    idPart(row.paymentInId) ??
    idPart(row.paymentOutId) ??
    idPart(row.recordId) ??
    idPart(row.transactionId) ??
    idPart(row.contactId) ??
    idPart(row.payee_id) ??
    idPart(row.tradeAccountNum) ??
    fallback
  );
}

export function mapRegistrationQueue(payload: unknown): QueueResult {
  const rows = asRecordList(
    isRecord(payload) ? payload.registrationQueue : payload,
  ).map((row, index) => ({
    id: rowId(row, `reg-${index}`),
    cells: [
      cell(row.registeredOn ?? row.registeredDate),
      cell(row.contactName),
      cell(row.type),
      cell(row.countryOfResidence),
      cell(row.organisation ?? row.organization),
      cell(row.complianceStatus ?? row.dataAnonStatus),
    ],
  }));
  return asQueue(payload, rows);
}

export function mapPaymentInQueue(payload: unknown): QueueResult {
  const rows = asRecordList(
    isRecord(payload) ? payload.paymentInQueue : payload,
  ).map((row, index) => ({
    id: rowId(row, `in-${index}`),
    cells: [
      cell(row.transactionId),
      cell(row.date),
      cell(row.contactName),
      "Inward",
      cell(row.amount),
      cell(row.overallStatus),
    ],
  }));
  return asQueue(payload, rows);
}

export function mapPaymentOutQueue(payload: unknown): QueueResult {
  const rows = asRecordList(
    isRecord(payload) ? payload.paymentOutQueue : payload,
  ).map((row, index) => ({
    id: rowId(row, `out-${index}`),
    cells: [
      cell(row.transactionId),
      cell(row.date),
      cell(row.contactName),
      "Outward",
      cell(row.amount),
      cell(row.overallStatus),
    ],
  }));
  return asQueue(payload, rows);
}

export function mapTransactionQueue(payload: unknown): QueueResult {
  const rows = asRecordList(
    isRecord(payload) ? payload.transactions : payload,
  ).map((row, index) => ({
    id: rowId(row, `txn-${index}`),
    cells: [
      cell(row.transactionId),
      cell(row.date),
      cell(row.contactName),
      cell(row.directionLabel ?? row.direction),
      cell(row.amount),
      cell(row.overallStatus),
    ],
  }));
  return asQueue(payload, rows);
}

export function mapTxnApiQueue(payload: unknown): QueueResult {
  const rows = asRecordList(
    isRecord(payload) ? payload.transactions : payload,
  ).map((row, index) => ({
    id: rowId(row, `txn-api-${index}`),
    cells: [
      cell(row.tradePaymentId ?? row.contractNumber),
      cell(row.date),
      cell(row.contactName),
      cell(row.type),
      cell(row.amount),
      cell(row.overallStatus),
    ],
  }));
  return asQueue(payload, rows);
}

export function mapDataAnonQueue(payload: unknown): QueueResult {
  const rows = asRecordList(
    isRecord(payload) ? payload.dataAnonymisation : payload,
  ).map((row, index) => ({
    id: rowId(row, `anon-${index}`),
    cells: [
      cell(row.tradeAccountNum ?? row.crmAccountID),
      cell(row.contactName),
      cell(row.dataAnonStatus ?? row.complianceStatus),
      cell(row.requestDate ?? row.registeredOn),
    ],
  }));
  return asQueue(payload, rows);
}

export function mapWorkEfficiency(payload: unknown): QueueResult {
  const rows = asRecordList(
    isRecord(payload) ? payload.workEfficiencyReportData : payload,
  ).map((row, index) => ({
    id: `${cell(row.userName)}-${index}`,
    cells: [
      cell(row.userName),
      cell(row.totalRows ?? row.releasedRecords),
      cell(row.seconds ?? row.timeEfficiency),
      cell(row.releasedRecords),
      cell(row.lockedRecords),
    ],
  }));
  return asQueue(payload, rows);
}

export function mapBeneficiaryQueue(payload: unknown): QueueResult {
  const list = isRecord(payload)
    ? (payload.payee_list ?? payload.payeeQueue ?? payload)
    : payload;
  const rows = asRecordList(list).map((row, index) => ({
    id: rowId(row, `bene-${index}`),
    cells: [
      joinName(row),
      cell(row.clientName ?? row.organizationName ?? row.organization),
      cell(row.accountNumber ?? row.beneAccountNumber),
      cell(row.countryName ?? row.country ?? row.countryCode),
      cell(row.payee_type ?? row.type ?? row.thirdParty),
    ],
  }));
  return asQueue(payload, rows);
}
