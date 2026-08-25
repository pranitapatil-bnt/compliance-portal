import "server-only";

import {
  getPaymentInQueue,
  getPaymentOutQueue,
  getRegistrationQueue,
} from "@/features/queues/services/queue-service";
import { ApiError } from "@/lib/api/errors";
import { complianceApi } from "@/lib/compliance/client";
import { logger } from "@/lib/logger";

import { emptyDashboard, type DashboardData } from "../data";
import { parseDashboardHtml } from "../parse-html";

function percent(part: number, whole: number): number {
  if (whole <= 0) {
    return 0;
  }
  return Math.floor((part * 100) / whole);
}

function clockNow(): string {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function withQueueTotals(
  base: DashboardData,
  personalTotal: number,
  corporateTotal: number,
  inwardTotal: number,
  outwardTotal: number,
): DashboardData {
  const onboardingTotal = personalTotal + corporateTotal;
  return {
    ...base,
    onboardingTotal,
    inwardTotal,
    outwardTotal,
    refreshOn: base.refreshOn || clockNow(),
    personal: {
      ...base.personal,
      total: personalTotal,
      percent: percent(personalTotal, onboardingTotal),
    },
    corporate: {
      ...base.corporate,
      total: corporateTotal,
      percent: percent(corporateTotal, onboardingTotal),
    },
    inward: {
      ...base.inward,
      total: inwardTotal,
    },
    outward: {
      ...base.outward,
      total: outwardTotal,
    },
  };
}

async function loadQueueFallback(error?: string): Promise<{
  data: DashboardData;
  error?: string;
}> {
  const [personalQueue, corporateQueue, inwardQueue, outwardQueue] =
    await Promise.all([
      getRegistrationQueue({ custType: "PERSONAL", maxRecord: 1 }),
      getRegistrationQueue({ custType: "CORPORATE", maxRecord: 1 }),
      getPaymentInQueue({ maxRecord: 1 }),
      getPaymentOutQueue({ maxRecord: 1 }),
    ]);

  return {
    error:
      error ??
      [
        personalQueue.error,
        corporateQueue.error,
        inwardQueue.error,
        outwardQueue.error,
      ].find((message): message is string => Boolean(message)),
    data: withQueueTotals(
      emptyDashboard(),
      personalQueue.total,
      corporateQueue.total,
      inwardQueue.total,
      outwardQueue.total,
    ),
  };
}

export async function loadDashboardData(): Promise<{
  data: DashboardData;
  error?: string;
}> {
  try {
    const html = await complianceApi.dashboardPage();
    const parsed = parseDashboardHtml(html);
    if (parsed) {
      return { data: parsed };
    }
    logger.warn("Java dashboard HTML did not match expected landing page");
  } catch (error) {
    logger.warn(
      `Dashboard HTML fetch failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return loadQueueFallback(
      error instanceof ApiError
        ? error.message
        : "Could not load dashboard data from the Java portal.",
    );
  }

  return loadQueueFallback();
}
