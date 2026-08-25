export const onboardingColumns = [
  "Date",
  "Client name",
  "Type",
  "Country of Residence",
  "Organization",
  "N/U",
  "Onboarding Date",
  "Transaction value",
  "E",
  "F",
  "S",
  "B",
  "C",
] as const;

export const onboardingCheckColumns = ["E", "F", "S", "B", "C"] as const;

export const onboardingCheckHints: Record<
  (typeof onboardingCheckColumns)[number],
  string
> = {
  E: "EID",
  F: "FraudPredict",
  S: "Sanction",
  B: "Blacklist",
  C: "CustomCheck",
};

export const transactionColumns = [
  "Payment ID",
  "Date",
  "Client",
  "Type",
  "Amount",
  "Status",
] as const;

export const txnApiQueueColumns = [
  "Payment ID",
  "Date",
  "Client",
  "Type",
  "Org",
  "Amount",
  "Status",
  "STP",
  "InitialStatus",
  "B",
  "S",
  "F",
  "C",
] as const;

export const txnApiCheckColumns = ["B", "S", "F", "C"] as const;

export const txnApiCheckHints: Record<
  (typeof txnApiCheckColumns)[number],
  string
> = {
  B: "Blacklist",
  S: "Sanction",
  F: "FraudPredict",
  C: "CustomCheck",
};

export const paymentColumns = [
  "Txn #",
  "Date",
  "Client",
  "Direction",
  "Amount",
  "Status",
] as const;

export const paymentsQueueColumns = [
  "Transaction ID",
  "Date",
  "Client name",
  "Type",
  "Organization",
  "Currency",
  "Amount",
  "Sender / Beneficiary",
  "Country",
  "Overall status",
  "Direction",
  "W",
  "F",
  "S",
  "B",
  "C",
] as const;

export const paymentsCheckColumns = ["W", "F", "S", "B", "C"] as const;

export const paymentsCheckHints: Record<
  (typeof paymentsCheckColumns)[number],
  string
> = {
  W: "Watchlist",
  F: "FraudPredict",
  S: "Sanction",
  B: "Blacklist",
  C: "CustomCheck",
};

export const dataAnonColumns = [
  "Request",
  "Client",
  "Status",
  "Requested on",
] as const;

export const beneficiaryColumns = [
  "Beneficiary",
  "Client",
  "Account",
  "Country",
  "Status",
] as const;

export const workEfficiencyColumns = [
  "Analyst",
  "Cases worked",
  "Avg time",
  "Cleared",
  "Rejected",
] as const;
