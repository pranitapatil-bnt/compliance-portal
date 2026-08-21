import { routes } from "@/constants/routes";

export type GeographyRow = {
  country: string;
  count: number;
};

export type Fulfilment = {
  avgClearingTime: number;
  avgPerHour: number;
  clearedToday: number;
};

export type Timeline = {
  oldest: number;
  average: number;
  newest: number;
  unit: "days" | "minutes";
};

export type CustomerSlice = {
  total: number;
  percent: number;
  geography: GeographyRow[];
  fulfilment: Fulfilment;
  timeline: Timeline;
};

export type PaymentSlice = {
  total: number;
  fulfilment: Fulfilment;
  timeline: Timeline;
};

export type DashboardData = {
  onboardingTotal: number;
  inwardTotal: number;
  outwardTotal: number;
  personal: CustomerSlice;
  corporate: CustomerSlice;
  inward: PaymentSlice;
  outward: PaymentSlice;
};

const emptyFulfilment: Fulfilment = {
  avgClearingTime: 0,
  avgPerHour: 0,
  clearedToday: 0,
};

export const dashboardPlaceholder: DashboardData = {
  onboardingTotal: 0,
  inwardTotal: 0,
  outwardTotal: 0,
  personal: {
    total: 0,
    percent: 0,
    geography: [{ country: "United Kingdom", count: 42 }],
    fulfilment: emptyFulfilment,
    timeline: { oldest: 107, average: 64, newest: 35, unit: "days" },
  },
  corporate: {
    total: 0,
    percent: 0,
    geography: [],
    fulfilment: emptyFulfilment,
    timeline: { oldest: 0, average: 0, newest: 0, unit: "days" },
  },
  inward: {
    total: 0,
    fulfilment: emptyFulfilment,
    timeline: { oldest: 146604, average: 146604, newest: 4616, unit: "minutes" },
  },
  outward: {
    total: 0,
    fulfilment: emptyFulfilment,
    timeline: { oldest: 214676, average: 116189, newest: 1461, unit: "minutes" },
  },
};

export const dashboardLinks = {
  onboarding: routes.reg,
  inward: routes.paymentIn,
  outward: routes.paymentOut,
} as const;
