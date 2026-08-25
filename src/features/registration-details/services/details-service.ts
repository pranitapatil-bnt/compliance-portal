import "server-only";

import { portalPaths } from "@/features/queues/paths";
import { buildQueueSearch } from "@/features/queues/search-body";
import { portalApiForm } from "@/lib/api/client";
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

function mergeDetails(
  base: RegistrationDetails,
  extras: Partial<RegistrationDetails>,
): RegistrationDetails {
  return {
    ...base,
    contactId: base.contactId ?? extras.contactId ?? null,
    accountId: base.accountId ?? extras.accountId ?? null,
    userResourceId: base.userResourceId ?? extras.userResourceId ?? null,
    orgCode: pickText(base.orgCode, extras.orgCode, base.organization),
    custType: pickText(base.custType, extras.custType) || "PERSONAL",
    preContactStatus:
      pickText(extras.preContactStatus, base.preContactStatus, base.status) ||
      "PENDING",
    preAccountStatus:
      pickText(extras.preAccountStatus, base.preAccountStatus, base.status) ||
      "PENDING",
    locked: base.locked || Boolean(extras.locked),
    owned: base.owned || Boolean(extras.owned),
    lockedBy: pickText(base.lockedBy, extras.lockedBy),
  };
}

async function fillFromQueue(
  details: RegistrationDetails,
  contactId: string,
): Promise<RegistrationDetails> {
  if (details.accountId != null) {
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
      userResourceId: asId(match.userResourceLockId),
      preContactStatus: match.complianceStatus ?? undefined,
      preAccountStatus: match.complianceStatus ?? undefined,
      custType: match.type ?? undefined,
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
    custType,
    preContactStatus: query.status?.trim() || "",
    preAccountStatus: query.status?.trim() || "",
  };

  try {
    const html = await portalApiForm(portalPaths.registrationDetails, {
      contactId,
      custType,
      source: "queue",
      searchCriteria: "",
    });
    const details = mergeDetails(
      parseRegistrationDetailsHtml(html),
      fromQuery,
    );
    if (details.clientNumber === "—" && details.name === "—") {
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
