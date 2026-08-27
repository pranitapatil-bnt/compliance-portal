"use client";

import { complianceBffPost } from "@/lib/compliance/browser";
import type {
  ActivityLogs,
  LockResourceRequest,
  LockResourceResponse,
  ProfileUpdateRequest,
} from "@/lib/compliance/types";
import { isRecord, readNumber, readString } from "@/lib/utils/guards";

export type ProfileActionInput = {
  contactId: number;
  accountId: number;
  orgCode: string;
  custType: string;
  updatedStatus: string;
  preContactStatus: string;
  preAccountStatus: string;
  comment: string;
  complianceLog: string;
  reason: string;
  userResourceId: number | null;
};

function portalError(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }
  const message = readString(payload.errorMessage)?.trim();
  if (message) {
    return message;
  }
  const code = payload.errorCode;
  if (code == null || code === "" || code === 0 || code === "0") {
    return undefined;
  }
  return String(code);
}

function throwIfFailed(payload: unknown, fallback: string): void {
  const error = portalError(payload);
  if (error) {
    throw new Error(error);
  }
  if (
    isRecord(payload) &&
    readString(payload.status) &&
    readString(payload.status)?.toUpperCase() !== "SUCCESS"
  ) {
    throw new Error(readString(payload.status) ?? fallback);
  }
}

export async function lockRegistration(input: {
  contactId: number;
  lock: boolean;
  userResourceId: number | null;
}): Promise<LockResourceResponse> {
  const body: LockResourceRequest = {
    id: input.contactId,
    lock: input.lock,
    userResourceId: input.userResourceId,
    resourceType: "REGISTRATION",
    resourceId: input.contactId,
  };
  const payload = await complianceBffPost<LockResourceResponse>(
    "lock-resource",
    body,
  );
  throwIfFailed(
    payload,
    input.lock ? "Could not lock this record." : "Could not unlock this record.",
  );
  return payload;
}

export async function updateRegistrationProfile(
  input: ProfileActionInput,
): Promise<ActivityLogs> {
  const body: ProfileUpdateRequest = {
    contactId: input.contactId,
    accountId: input.accountId,
    accountSfId: null,
    contactSfId: null,
    orgCode: input.orgCode || null,
    custType: input.custType || null,
    updatedContactStatus: input.updatedStatus,
    preContactStatus: input.preContactStatus || null,
    updatedAccountStatus: input.updatedStatus,
    preAccountStatus: input.preAccountStatus || null,
    comment: input.comment || null,
    contactStatusReasons: input.reason
      ? input.reason
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    watchlist: [],
    overallWatchlistStatus: false,
    complianceDoneOn: null,
    registrationInDate: null,
    complianceExpiry: null,
    complianceLog: input.complianceLog || null,
    isOnQueue: true,
    fraugsterEventServiceLogId: null,
    userResourceId: input.userResourceId,
    createdBy: null,
  };
  const payload = await complianceBffPost<ActivityLogs>("profile-update", body);
  throwIfFailed(payload, "Could not update this record.");
  return payload;
}

export function readLockId(payload: LockResourceResponse): number | null {
  return readNumber(payload.userResourceId) ?? null;
}
