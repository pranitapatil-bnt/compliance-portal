import "server-only";

import {
  getPaymentInQueue,
  getPaymentOutQueue,
  getRegistrationQueue,
} from "@/features/queues/services/queue-service";

import { dashboardPlaceholder, type DashboardData } from "../data";

function percent(part: number, whole: number): number {
  if (whole <= 0) {
    return 0;
  }
  return Math.round((part / whole) * 100);
}

export async function loadDashboardData(): Promise<{
  data: DashboardData;
  error?: string;
}> {
  const [personalQueue, corporateQueue, inwardQueue, outwardQueue] =
    await Promise.all([
      getRegistrationQueue({ custType: "PERSONAL" }),
      getRegistrationQueue({ custType: "CORPORATE" }),
      getPaymentInQueue(),
      getPaymentOutQueue(),
    ]);

  const personalTotal = personalQueue.total;
  const corporateTotal = corporateQueue.total;
  const onboardingTotal = personalTotal + corporateTotal;
  const error = [
    personalQueue.error,
    corporateQueue.error,
    inwardQueue.error,
    outwardQueue.error,
  ].find((message): message is string => Boolean(message));

  return {
    error,
    data: {
      ...dashboardPlaceholder,
      onboardingTotal,
      inwardTotal: inwardQueue.total,
      outwardTotal: outwardQueue.total,
      personal: {
        ...dashboardPlaceholder.personal,
        total: personalTotal,
        percent: percent(personalTotal, onboardingTotal),
      },
      corporate: {
        ...dashboardPlaceholder.corporate,
        total: corporateTotal,
        percent: percent(corporateTotal, onboardingTotal),
      },
      inward: {
        ...dashboardPlaceholder.inward,
        total: inwardQueue.total,
      },
      outward: {
        ...dashboardPlaceholder.outward,
        total: outwardQueue.total,
      },
    },
  };
}
