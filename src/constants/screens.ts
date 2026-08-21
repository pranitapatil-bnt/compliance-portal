export const onboardingColumns = [
  "Date",
  "Client",
  "Type",
  "Country",
  "Org",
  "Status",
] as const;

export const transactionColumns = [
  "Payment ID",
  "Date",
  "Client",
  "Type",
  "Amount",
  "Status",
] as const;

export const paymentColumns = [
  "Txn #",
  "Date",
  "Client",
  "Direction",
  "Amount",
  "Status",
] as const;

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
