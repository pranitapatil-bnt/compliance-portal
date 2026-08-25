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
    idPart(row.tradePaymentId) ??
    idPart(row.recordId) ??
    idPart(row.transactionId) ??
    idPart(row.contactId) ??
    idPart(row.payee_id) ??
    idPart(row.tradeAccountNum) ??
    fallback
  );
}

function checkCell(value: unknown): string {
  const text = readString(value)?.trim();
  return text && text.length > 0 ? text.toUpperCase() : "FAIL";
}

function checkCellOrNa(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "PASS" : "FAIL";
  }
  const text = readString(value)?.trim();
  return text && text.length > 0 ? text.toUpperCase() : "NOT_REQUIRED";
}

function stpCell(value: unknown): string {
  if (value === true || value === "true" || value === "Y" || value === "Yes") {
    return "Y";
  }
  if (value === false || value === "false" || value === "N" || value === "No") {
    return "N";
  }
  const text = readString(value)?.trim();
  return text && text.length > 0 ? text : "—";
}

function amountCell(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(2);
  }
  const text = readString(value)?.trim();
  return text && text.length > 0 ? text : "—";
}

function blankCell(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return readString(value)?.trim() ?? "";
}

function onboardingDateCell(value: unknown): string {
  const text = readString(value)?.trim();
  return text && text.length > 0 ? text : "------";
}

function isLocked(value: unknown): boolean {
  return value === true || value === "true";
}

export function readOrgLabels(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const labels: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const text = item.trim();
      if (text) {
        labels.push(text);
      }
      continue;
    }
    if (!isRecord(item)) {
      continue;
    }
    const text =
      readString(item.name)?.trim() ||
      readString(item.code)?.trim() ||
      readString(item.organization)?.trim() ||
      "";
    if (text) {
      labels.push(text);
    }
  }
  return labels;
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = readString(value)?.trim();
    if (text) {
      return text;
    }
  }
  return "";
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDateTime(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${padDatePart(date.getDate())}/${padDatePart(date.getMonth() + 1)}/${date.getFullYear()} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`;
}

function formatAnonValue(value: unknown): string {
  if (value == null || value === "") {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 1_000_000_000) {
      const ms = value > 1e12 ? value : value * 1000;
      return formatDateTime(new Date(ms));
    }
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (
    Array.isArray(value) &&
    value.length >= 3 &&
    value.every((part) => typeof part === "number")
  ) {
    const year = value[0];
    const month = value[1];
    const day = value[2];
    if (year == null || month == null || day == null) {
      return "";
    }
    const hour = value[3] ?? 0;
    const minute = value[4] ?? 0;
    const second = value[5] ?? 0;
    return formatDateTime(new Date(year, month - 1, day, hour, minute, second));
  }
  if (isRecord(value)) {
    return (
      firstText(
        value.userName,
        value.username,
        value.name,
        value.date,
        value.dateTime,
        value.value,
      ) || formatAnonValue(value.time)
    );
  }
  return "";
}

function rowValue(
  row: Record<string, unknown>,
  aliases: readonly string[],
): unknown {
  for (const alias of aliases) {
    if (alias in row && row[alias] != null && row[alias] !== "") {
      return row[alias];
    }
  }
  const lower = new Map(
    Object.keys(row).map((key) => [key.toLowerCase(), row[key]]),
  );
  for (const alias of aliases) {
    const match = lower.get(alias.toLowerCase());
    if (match != null && match !== "") {
      return match;
    }
  }
  return undefined;
}

function findByKeyParts(
  row: Record<string, unknown>,
  include: readonly string[],
  exclude: readonly string[] = [],
): string {
  for (const [key, value] of Object.entries(row)) {
    const lower = key.toLowerCase();
    if (!include.every((part) => lower.includes(part))) {
      continue;
    }
    if (exclude.some((part) => lower.includes(part))) {
      continue;
    }
    const formatted = formatAnonValue(value);
    if (formatted) {
      return formatted;
    }
  }
  return "";
}

function anonCell(
  row: Record<string, unknown>,
  aliases: readonly string[],
  fallback?: { include: readonly string[]; exclude?: readonly string[] },
): string {
  const formatted = formatAnonValue(rowValue(row, aliases));
  if (formatted.length > 0) {
    return formatted;
  }
  if (fallback) {
    const found = findByKeyParts(row, fallback.include, fallback.exclude ?? []);
    if (found) {
      return found;
    }
  }
  return "—";
}

function currentUserName(payload: unknown): string | undefined {
  if (!isRecord(payload) || !isRecord(payload.user)) {
    return undefined;
  }
  return readString(payload.user.name) ?? readString(payload.user.userName);
}

function directionCell(value: unknown): string {
  const text = firstText(value);
  const normalized = text.toUpperCase().replace(/[\s-]+/g, "_");
  if (
    normalized === "IN" ||
    normalized === "INWARD" ||
    normalized === "PAYIN" ||
    normalized === "PAYMENT_IN" ||
    normalized === "FUNDS_IN"
  ) {
    return "Inward";
  }
  if (
    normalized === "OUT" ||
    normalized === "OUTWARD" ||
    normalized === "PAYOUT" ||
    normalized === "PAYMENT_OUT" ||
    normalized === "FUNDS_OUT"
  ) {
    return "Outward";
  }
  return text ? text : "—";
}

export function mapRegistrationQueue(payload: unknown): QueueResult {
  const userName = currentUserName(payload);
  const rows = asRecordList(
    isRecord(payload) ? payload.registrationQueue : payload,
  ).map((row, index) => {
    const contactId = idPart(row.contactId) ?? idPart(row.clientId);
    const type = firstText(row.type) || "PERSONAL";
    const locked = isLocked(row.locked);
    const lockedBy = readString(row.lockedBy);
    const params = new URLSearchParams({ type });
    const accountId = idPart(row.accountId);
    const org = firstText(row.organisation, row.organization);
    const lockId = idPart(row.userResourceLockId);
    const status = firstText(row.complianceStatus, row.overallStatus);
    if (accountId) {
      params.set("accountId", accountId);
    }
    if (org) {
      params.set("org", org);
    }
    if (lockId) {
      params.set("lockId", lockId);
    }
    if (status) {
      params.set("status", status);
    }
    return {
      id: rowId(row, `reg-${index}`),
      contactId,
      type,
      href: contactId ? `/reg/${contactId}?${params.toString()}` : undefined,
      locked,
      owned: Boolean(locked && lockedBy && userName && lockedBy === userName),
      lockedBy,
      cells: [
        cell(row.registeredOn),
        cell(row.contactName),
        cell(row.type),
        cell(row.countryOfResidence),
        cell(firstText(row.organisation, row.organization)),
        cell(row.newOrUpdated),
        onboardingDateCell(row.registeredDate),
        cell(row.transactionValue),
        checkCell(firstText(row.eidCheck, row.kycStatus)),
        checkCell(row.fraugster),
        checkCell(row.sanction),
        checkCell(row.blacklist),
        checkCell(row.customCheck),
      ],
    };
  });
  const result = asQueue(payload, rows);
  result.organizations = isRecord(payload)
    ? readOrgLabels(payload.organization)
    : [];
  return result;
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
  const userName = currentUserName(payload);
  const rows = asRecordList(
    isRecord(payload)
      ? (payload.transactionQueue ?? payload.transactions)
      : payload,
  ).map((row, index) => {
    const locked = isLocked(row.locked);
    const lockedBy = readString(row.lockedBy);
    return {
      id: rowId(row, `txn-${index}`),
      locked,
      owned: Boolean(locked && lockedBy && userName && lockedBy === userName),
      lockedBy,
      cells: [
        cell(row.transactionId ?? row.recordId),
        cell(row.date),
        cell(row.contactName),
        cell(row.type),
        cell(firstText(row.organization, row.organisation)),
        cell(firstText(row.currency, row.sellCurrency, row.buyCurrency)),
        cell(row.amount),
        cell(
          firstText(
            row.detail,
            row.method,
            row.beneficiary,
            row.vendorGroup,
            row.sender,
          ),
        ),
        cell(firstText(row.country, row.countryFullName, row.isoCountry)),
        cell(row.overallStatus),
        directionCell(firstText(row.directionLabel, row.direction)),
        checkCell(row.watchlist),
        checkCell(row.fraugster),
        checkCell(row.sanction),
        checkCell(row.blacklist),
        checkCell(row.customCheck),
      ],
    };
  });
  const result = asQueue(payload, rows);
  result.organizations = isRecord(payload)
    ? readOrgLabels(payload.organization)
    : [];
  return result;
}

export function mapTxnApiQueue(payload: unknown): QueueResult {
  const userName = currentUserName(payload);
  const list = isRecord(payload)
    ? (payload.transactions ?? payload.txnApiQueue ?? payload)
    : payload;
  const rows = asRecordList(list).map((row, index) => {
    const locked = isLocked(row.locked);
    const lockedBy = readString(row.lockedBy);
    return {
      id: rowId(row, `txn-api-${index}`),
      locked,
      owned: Boolean(locked && lockedBy && userName && lockedBy === userName),
      lockedBy,
      cells: [
        cell(
          row.tradePaymentId ??
            row.paymentId ??
            row.transactionId ??
            row.contractNumber,
        ),
        cell(row.date),
        cell(row.contactName),
        cell(row.type),
        cell(firstText(row.organization, row.organisation, row.org)),
        amountCell(row.amount),
        cell(firstText(row.overallStatus, row.status)),
        stpCell(row.stp ?? row.stpFlag ?? row.isStp),
        blankCell(row.initialStatus),
        checkCellOrNa(row.blacklist),
        checkCellOrNa(row.sanction),
        checkCellOrNa(row.fraugster),
        checkCellOrNa(row.customCheck),
      ],
    };
  });
  return asQueue(payload, rows);
}

export function mapDataAnonQueue(payload: unknown): QueueResult {
  const list = isRecord(payload)
    ? (payload.dataAnonymisation ??
      payload.dataAnonymization ??
      payload.dataAnonQueue ??
      payload)
    : payload;
  const rows = asRecordList(list).map((row, index) => {
    const status = firstText(
      row.dataAnonStatus,
      row.complianceStatus,
      row.status,
    );
    return {
      id: rowId(row, `anon-${index}`),
      contactId: idPart(row.contactId) ?? idPart(row.clientId),
      type: firstText(row.type, row.custType) || "PERSONAL",
      status,
      cells: [
        cell(
          row.tradeAccountNum ??
            row.crmAccountID ??
            row.clientNumber ??
            row.clientNo,
        ),
        cell(firstText(row.contactName, row.clientName)),
        cell(firstText(row.type, row.custType) || "PERSONAL"),
        anonCell(
          row,
          [
            "requestedDate",
            "requestDate",
            "requestedOn",
            "requestOn",
            "requestedDateTime",
            "requestDateTime",
            "dataAnonRequestedDate",
            "dataAnonRequestDate",
            "daRequestedDate",
            "dateRequested",
            "createdOn",
            "createdDate",
            "userResourceCreatedOn",
            "registeredOn",
          ],
          { include: ["request", "date"], exclude: ["approv"] },
        ),
        anonCell(
          row,
          [
            "requestedBy",
            "requestBy",
            "requestedByUser",
            "requestedByName",
            "requestedUser",
            "requestUser",
            "requester",
            "requesterName",
            "dataAnonRequestedBy",
            "daRequestedBy",
            "createdBy",
            "createdByUser",
          ],
          { include: ["request", "by"], exclude: ["date", "approv"] },
        ),
        anonCell(
          row,
          [
            "approvedDate",
            "approvedOn",
            "approvedDateTime",
            "dateApproved",
            "dataAnonApprovedDate",
            "daApprovedDate",
            "updatedOn",
            "modifiedOn",
            "userResourceWorkflowTime",
          ],
          { include: ["approv", "date"] },
        ),
        anonCell(
          row,
          [
            "approvedBy",
            "approvedByUser",
            "approvedByName",
            "approver",
            "approverName",
            "approvedUser",
            "dataAnonApprovedBy",
            "daApprovedBy",
            "updatedBy",
            "modifiedBy",
          ],
          { include: ["approv", "by"], exclude: ["date"] },
        ),
        cell(status),
      ],
    };
  });
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
