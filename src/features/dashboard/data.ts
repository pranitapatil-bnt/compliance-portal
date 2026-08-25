import { routes } from "@/constants/routes";

export type GeographyRow = {
  country: string;
  count: number;
  countryCode?: string;
};

export type LegalEntityRow = {
  legalEntity: string;
  visits: number;
};

export type FulfilmentSlice = {
  title: string;
  value: number;
};

export type Fulfilment = {
  avgClearingTime: number;
  avgPerHour: number;
  clearedToday: number;
  graph: FulfilmentSlice[];
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
  legalEntities: LegalEntityRow[];
  fulfilment: Fulfilment;
  timeline: Timeline;
};

export type PaymentSlice = {
  total: number;
  legalEntities: LegalEntityRow[];
  fulfilment: Fulfilment;
  timeline: Timeline;
};

export type DashboardData = {
  onboardingTotal: number;
  inwardTotal: number;
  outwardTotal: number;
  refreshOn: string;
  personal: CustomerSlice;
  corporate: CustomerSlice;
  inward: PaymentSlice;
  outward: PaymentSlice;
};

const emptyFulfilment = (): Fulfilment => ({
  avgClearingTime: 0,
  avgPerHour: 0,
  clearedToday: 0,
  graph: [],
});

const emptyCustomer = (unit: Timeline["unit"]): CustomerSlice => ({
  total: 0,
  percent: 0,
  geography: [],
  legalEntities: [],
  fulfilment: emptyFulfilment(),
  timeline: { oldest: 0, average: 0, newest: 0, unit },
});

const emptyPayment = (): PaymentSlice => ({
  total: 0,
  legalEntities: [],
  fulfilment: emptyFulfilment(),
  timeline: { oldest: 0, average: 0, newest: 0, unit: "minutes" },
});

export const emptyDashboard = (): DashboardData => ({
  onboardingTotal: 0,
  inwardTotal: 0,
  outwardTotal: 0,
  refreshOn: "",
  personal: emptyCustomer("days"),
  corporate: emptyCustomer("days"),
  inward: emptyPayment(),
  outward: emptyPayment(),
});

export const dashboardLinks = {
  onboarding: routes.reg,
  inward: routes.paymentIn,
  outward: routes.paymentOut,
} as const;
