import "server-only";

import { portalPaths } from "@/features/queues/paths";
import { ApiError } from "@/lib/api/errors";
import { portalApiForm } from "@/lib/api/client";
import { logger } from "@/lib/logger";

import { parseRegistrationDetailsHtml } from "../parse-html";
import { emptyDetails, type RegistrationDetails } from "../types";

export async function getRegistrationDetails(
  contactId: string,
  custType = "PERSONAL",
): Promise<RegistrationDetails> {
  try {
    const html = await portalApiForm(portalPaths.registrationDetails, {
      contactId,
      custType,
      source: "queue",
      searchCriteria: "",
    });
    const details = parseRegistrationDetailsHtml(html);
    if (details.clientNumber === "—" && details.name === "—") {
      return {
        ...emptyDetails,
        error: "No client details were returned for this record.",
      };
    }
    return details;
  } catch (error) {
    logger.warn(
      `registrationDetails failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return {
      ...emptyDetails,
      error:
        error instanceof ApiError
          ? error.message
          : "Could not load registration details from the Java portal.",
    };
  }
}
