import "server-only";

import { buildQueueSearch } from "@/features/queues/search-body";
import { ApiError } from "@/lib/api/errors";
import { complianceApi } from "@/lib/compliance/client";
import { logger } from "@/lib/logger";

import { parseRegistrationDetailsHtml } from "../parse-html";
import { emptyDetails, type RegistrationDetails } from "../types";

export type DetailsQuery = {
  type?: string;
  accountId?: string;
  org?: string;
  lockId?: string;
  status?: string;
  name?: string;
  country?: string;
  etv?: string;
  clientNo?: string;
  from?: string;
};

function asId(value: string | number | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }
  return null;
}

function pickText(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const text = value?.trim();
    if (text && text !== "—") {
      return text;
    }
  }
  return "";
}

function display(base: string, extra?: string | null): string {
  return pickText(base, extra) || base;
}

function mergeDetails(
  base: RegistrationDetails,
  extras: Partial<RegistrationDetails>,
): RegistrationDetails {
  return {
    ...base,
    contactId: base.contactId ?? extras.contactId ?? null,
    accountId: base.accountId ?? extras.accountId ?? null,
    userResourceId: base.userResourceId ?? extras.userResourceId ?? null,
    orgCode: pickText(base.orgCode, extras.orgCode, extras.organization),
    custType: pickText(base.custType, extras.custType) || "PERSONAL",
    preContactStatus:
      pickText(extras.preContactStatus, base.preContactStatus, base.status) ||
      "PENDING",
    preAccountStatus:
      pickText(extras.preAccountStatus, base.preAccountStatus, base.status) ||
      "PENDING",
    clientNumber: display(base.clientNumber, extras.clientNumber),
    status: pickText(base.status, extras.status) || base.status,
    name: display(base.name, extras.name),
    clientType: display(base.clientType, extras.clientType ?? extras.custType),
    occupation: display(base.occupation, extras.occupation),
    email: display(base.email, extras.email),
    legalEntity: display(base.legalEntity, extras.legalEntity),
    dateOfBirth: display(base.dateOfBirth, extras.dateOfBirth),
    currencyPair: display(base.currencyPair, extras.currencyPair),
    estimatedTxnValue: display(
      base.estimatedTxnValue,
      extras.estimatedTxnValue,
    ),
    purposeOfTxn: display(base.purposeOfTxn, extras.purposeOfTxn),
    countryOfResidence: display(
      base.countryOfResidence,
      extras.countryOfResidence,
    ),
    organization: display(
      base.organization,
      extras.organization ?? extras.orgCode,
    ),
    sourceOfFunds: display(base.sourceOfFunds, extras.sourceOfFunds),
    primaryContact: display(base.primaryContact, extras.primaryContact),
    locked: base.locked || Boolean(extras.locked),
    owned: base.owned || Boolean(extras.owned),
    lockedBy: pickText(base.lockedBy, extras.lockedBy),
    source: extras.source ?? base.source,
  };
}

async function fillFromQueue(
  details: RegistrationDetails,
  contactId: string,
): Promise<RegistrationDetails> {
  const needsQueue =
    details.accountId == null ||
    details.name === "—" ||
    details.clientNumber === "—" ||
    details.clientNumber === "";

  if (!needsQueue) {
    return details;
  }

  try {
    const payload = await complianceApi.regQueue(
      buildQueueSearch({
        keyword: contactId,
        custType: details.custType || undefined,
      }),
    );
    const match = (payload.registrationQueue ?? []).find(
      (row) => String(row.contactId ?? "") === String(contactId),
    );
    if (!match) {
      return details;
    }

    const lockedBy = match.lockedBy ?? undefined;
    const userName = payload.user?.name;

    return mergeDetails(details, {
      accountId: asId(match.accountId),
      orgCode: match.organisation ?? undefined,
      organization: match.organisation ?? undefined,
      userResourceId: asId(match.userResourceLockId),
      preContactStatus: match.complianceStatus ?? undefined,
      preAccountStatus: match.complianceStatus ?? undefined,
      status: match.complianceStatus ?? undefined,
      custType: match.type ?? undefined,
      clientType: match.type ?? undefined,
      name: match.contactName ?? undefined,
      countryOfResidence: match.countryOfResidence ?? undefined,
      estimatedTxnValue: match.transactionValue ?? undefined,
      clientNumber: match.tradeAccountNum ?? undefined,
      legalEntity: match.legalEntity ?? undefined,
      locked: match.locked === true,
      lockedBy,
      owned: Boolean(
        match.locked && lockedBy && userName && lockedBy === userName,
      ),
    });
  } catch (error) {
    logger.warn(
      `Could not fill registration details from /regQueue: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return details;
  }
}

export async function getRegistrationDetails(
  contactId: string,
  query: DetailsQuery = {},
): Promise<RegistrationDetails> {
  const custType = query.type?.trim() || "PERSONAL";
  const fromQuery: Partial<RegistrationDetails> = {
    contactId: asId(contactId),
    accountId: asId(query.accountId),
    userResourceId: asId(query.lockId),
    orgCode: query.org?.trim() || "",
    organization: query.org?.trim() || "",
    custType,
    clientType: custType,
    preContactStatus: query.status?.trim() || "",
    preAccountStatus: query.status?.trim() || "",
    status: query.status?.trim() || undefined,
    name: query.name?.trim() || undefined,
    countryOfResidence: query.country?.trim() || undefined,
    estimatedTxnValue: query.etv?.trim() || undefined,
    clientNumber: query.clientNo?.trim() || undefined,
    source: query.from === "report" ? "REPORT" : "QUEUE",
  };

  try {
    const html = await complianceApi.registrationDetailsPage({
      contactId,
      custType,
      source: query.from === "report" ? "REPORT" : "QUEUE",
    });
    const details = mergeDetails(
      parseRegistrationDetailsHtml(html),
      fromQuery,
    );
    if (details.clientNumber === "—" && details.name === "—") {
      const fallback = mergeDetails({ ...emptyDetails }, fromQuery);
      if (fallback.name !== "—" && fallback.name) {
        return fillFromQueue(fallback, contactId);
      }
      return {
        ...emptyDetails,
        ...fromQuery,
        error: "No client details were returned for this record.",
      };
    }
    return fillFromQueue(details, contactId);
  } catch (error) {
    logger.warn(
      `registrationDetails failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    const fallback = mergeDetails({ ...emptyDetails }, fromQuery);
    if (fallback.name && fallback.name !== "—") {
      return fillFromQueue(
        {
          ...fallback,
          error:
            error instanceof ApiError
              ? error.message
              : "Could not load the full record. Showing data from the onboarding queue.",
        },
        contactId,
      );
    }
    return {
      ...emptyDetails,
      ...fromQuery,
      error:
        error instanceof ApiError
          ? error.message
          : "Could not load registration details from the Java portal.",
    };
  }
}
