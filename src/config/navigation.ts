import { routes } from "@/constants/routes";

export const queueNav = [
  {
    href: routes.reg,
    label: "Onboarding",
    description: "Failed onboarding checks",
  },
  {
    href: routes.txnApi,
    label: "Transaction",
    description: "Unified /transaction API records",
  },
  {
    href: routes.transactions,
    label: "Payments",
    description: "Inward / outward review",
  },
  {
    href: routes.dataAnon,
    label: "Data anonymisation",
    description: "GDPR requests",
  },
] as const;

export const reportNav = {
  search: [
    { href: routes.reportsOnboarding, label: "Onboarding" },
    { href: routes.reportsTransactions, label: "Transaction" },
    { href: routes.reportsPayments, label: "Payments" },
    { href: routes.reportsHolistic, label: "Holistic view" },
  ],
  insights: [
    { href: routes.reportsWorkEfficiency, label: "Work efficiency" },
    { href: routes.reportsBeneficiaries, label: "Beneficiaries" },
  ],
} as const;

export const quickActions = [
  { href: routes.reg, label: "Onboarding queue" },
  { href: routes.txnApi, label: "Transaction queue" },
  { href: routes.transactions, label: "Payments queue" },
  { href: routes.reportsHolistic, label: "Holistic search" },
] as const;

export const queuePaths = [
  routes.reg,
  routes.txnApi,
  routes.transactions,
  routes.dataAnon,
] as const;

export const reportPaths = [
  routes.reportsOnboarding,
  routes.reportsTransactions,
  routes.reportsPayments,
  routes.reportsHolistic,
  routes.reportsWorkEfficiency,
  routes.reportsBeneficiaries,
] as const;
