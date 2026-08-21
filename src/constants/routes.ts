export const routes = {
  home: "/",
  login: "/login",
  logout: "/logout",
  authLogin: "/api/auth/login",
  reg: "/reg",
  txnApi: "/txn-api",
  transactions: "/transactions",
  paymentIn: "/payment-in",
  paymentOut: "/payment-out",
  dataAnon: "/data-anon",
  reportsOnboarding: "/reports/onboarding",
  reportsTransactions: "/reports/transactions",
  reportsPayments: "/reports/payments",
  reportsHolistic: "/reports/holistic",
  reportsWorkEfficiency: "/reports/work-efficiency",
  reportsBeneficiaries: "/reports/beneficiaries",
  users: "/users",
  products: "/products",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
