export type HttpMethod = "GET" | "POST";

export type ComplianceEndpoint = {
  slug: string;
  method: HttpMethod;
  path: string;
};

/**
 * JSON APIs only. HTML pages ( /reg, /registrationDetails, /paymentInQueue,
 * /paymentInDetail, /payOutQueue, /paymentOutDetail, GET /transactionQueue )
 * are intentionally omitted.
 */
export const COMPLIANCE_ENDPOINTS = [
  { slug: "reg-queue", method: "POST", path: "/regQueue" },
  { slug: "profile-update", method: "POST", path: "/profileUpdate" },
  { slug: "lock-resource", method: "POST", path: "/lockResource" },
  {
    slug: "lock-resource-multi-contact",
    method: "POST",
    path: "/lockResourceMultiContact",
  },
  { slug: "reg-activites", method: "POST", path: "/regActivites" },
  { slug: "view-more-details", method: "POST", path: "/viewMoreDetails" },
  {
    slug: "get-provider-response",
    method: "POST",
    path: "/getProviderResponse",
  },
  { slug: "get-device-info", method: "POST", path: "/getDeviceInfo" },
  { slug: "get-account-history", method: "POST", path: "/getAccountHistory" },
  { slug: "set-poi-exists-flag", method: "POST", path: "/setPoiExistsFlag" },

  { slug: "pay-in-queue", method: "POST", path: "/payInQueue" },
  { slug: "payment-in-update", method: "POST", path: "/paymentInUpdate" },
  { slug: "payment-in-activites", method: "POST", path: "/paymentInActivites" },
  {
    slug: "get-payment-in-view-more-details",
    method: "POST",
    path: "/getPaymentInViewMoreDetails",
  },
  {
    slug: "set-poi-exists-flag-for-payment-in",
    method: "POST",
    path: "/setPoiExistsFlagForPaymentIn",
  },

  { slug: "payment-out-queue", method: "POST", path: "/paymentOutQueue" },
  { slug: "payment-out-update", method: "POST", path: "/paymentOutUpdate" },
  {
    slug: "payment-out-activites",
    method: "POST",
    path: "/paymentOutActivites",
  },
  {
    slug: "get-payment-out-view-more-details",
    method: "POST",
    path: "/getPaymentOutViewMoreDetails",
  },
  {
    slug: "get-further-payment-out-details",
    method: "POST",
    path: "/getFurtherPaymentOutDetails",
  },
  {
    slug: "set-poi-exists-flag-for-payment-out",
    method: "POST",
    path: "/setPoiExistsFlagForPaymentOut",
  },

  { slug: "transaction-queue", method: "POST", path: "/transactionQueue" },
  { slug: "txn-api-queue", method: "POST", path: "/txnApiQueue" },
  { slug: "txn-api-report", method: "POST", path: "/txnApiReport" },
  { slug: "txn-api-update", method: "POST", path: "/txnApiUpdate" },

  { slug: "reg-report-criteria", method: "POST", path: "/regReportCriteria" },
  {
    slug: "payment-in-report-criteria",
    method: "POST",
    path: "/paymentInReportCriteria",
  },
  {
    slug: "payment-out-report-criteria",
    method: "POST",
    path: "/paymentOutReportCriteria",
  },
  { slug: "transaction-report", method: "POST", path: "/transactionReport" },
  {
    slug: "work-efficiency-report",
    method: "POST",
    path: "/workEfficiencyReport",
  },

  {
    slug: "get-payment-in-activity-logs",
    method: "POST",
    path: "/getPaymentInActivityLogs",
  },
  {
    slug: "get-payment-out-activity-logs",
    method: "POST",
    path: "/getPaymentOutActivityLogs",
  },
  {
    slug: "get-registration-activity-logs",
    method: "POST",
    path: "/getRegistrationActivityLogs",
  },
  {
    slug: "get-all-activity-logs",
    method: "POST",
    path: "/getAllActivityLogs",
  },

  {
    slug: "get-fraud-ring-details",
    method: "POST",
    path: "/getFraudRingDetails",
  },
  {
    slug: "check-is-fraud-ring-present",
    method: "POST",
    path: "/checkIsFraudRingPresent",
  },
  { slug: "get-node-details", method: "POST", path: "/getNodeDetails" },
  { slug: "get-social-data", method: "POST", path: "/getSocialData" },

  { slug: "bene-report-apply", method: "POST", path: "/beneReportApply" },
  {
    slug: "get-beneficiary-list-of-client",
    method: "POST",
    path: "/getBeneficiaryListOfClient",
  },
  { slug: "get-transaction-list", method: "POST", path: "/getTransactionList" },

  {
    slug: "get-customer-all-wallet-list",
    method: "POST",
    path: "/getCustomerAllWalletList",
  },
  {
    slug: "get-customer-fx-ticket-list",
    method: "POST",
    path: "/getCustomerFXTicketList",
  },
  { slug: "get-card-pilot-list", method: "POST", path: "/getCardPilotList" },

  { slug: "velocity-rules", method: "GET", path: "/velocityRules" },
  {
    slug: "velocity-rules/update",
    method: "POST",
    path: "/velocityRules/update",
  },
  { slug: "organizations", method: "GET", path: "/organizations" },
  { slug: "legal-entities", method: "GET", path: "/legalEntities" },
  { slug: "currencies", method: "GET", path: "/currencies" },
  { slug: "client-onboarding", method: "POST", path: "/clientOnboarding" },

  {
    slug: "recheck-registration",
    method: "POST",
    path: "/recheckRegistration",
  },
  { slug: "recheck-funds-in", method: "POST", path: "/recheckFundsIn" },
  { slug: "recheck-funds-out", method: "POST", path: "/recheckFundsOut" },
  {
    slug: "registration-service-failure-count",
    method: "POST",
    path: "/registrationServiceFailureCount",
  },
  {
    slug: "funds-in-service-failure-count",
    method: "POST",
    path: "/fundsInServiceFailureCount",
  },
  {
    slug: "funds-out-service-failure-count",
    method: "POST",
    path: "/fundsOutServiceFailureCount",
  },
  { slug: "force-clear-funds-in", method: "POST", path: "/forceClearFundsIn" },
  {
    slug: "force-clear-funds-outs",
    method: "POST",
    path: "/forceClearFundsOuts",
  },
  {
    slug: "repeat-check-progress-bar",
    method: "POST",
    path: "/repeatCheckProgressBar",
  },
  {
    slug: "delete-reprocess-failed",
    method: "POST",
    path: "/deleteReprocessFailed",
  },
  {
    slug: "update-tmmq-retry-count",
    method: "POST",
    path: "/updateTMMQRetryCount",
  },
  {
    slug: "show-count-reprocess-failed",
    method: "GET",
    path: "/showCountReprocessFailed",
  },
  {
    slug: "clear-reprocess-failed",
    method: "GET",
    path: "/clearReprocessFailed",
  },
  {
    slug: "update-post-card-tmmq-retry-count",
    method: "POST",
    path: "/updatePostCardTMMQRetryCount",
  },
  {
    slug: "sync-reg-with-intuition",
    method: "POST",
    path: "/syncRegWithIntuition",
  },

  { slug: "data-anon-queue", method: "POST", path: "/dataAnonQueue" },
  { slug: "get-data-anonymize", method: "POST", path: "/getDataAnonymize" },
  { slug: "update-data-anon", method: "POST", path: "/updateDataAnon" },
  { slug: "cancel-data-anon", method: "POST", path: "/cancelDataAnon" },
  {
    slug: "get-data-anon-history",
    method: "POST",
    path: "/getDataAnonHistory",
  },

  { slug: "saved-search", method: "POST", path: "/savedSearch" },
  { slug: "update-saved-search", method: "POST", path: "/updateSavedSearch" },
  { slug: "delete-saved-search", method: "POST", path: "/deleteSavedSearch" },
] as const satisfies readonly ComplianceEndpoint[];

export type ComplianceSlug = (typeof COMPLIANCE_ENDPOINTS)[number]["slug"];

const bySlug = new Map<string, ComplianceEndpoint>(
  COMPLIANCE_ENDPOINTS.map((endpoint) => [endpoint.slug, endpoint]),
);

export function findComplianceEndpoint(
  slug: string,
): ComplianceEndpoint | undefined {
  return bySlug.get(slug);
}

export const compliancePath = {
  dashboard: "/",
  regQueue: "/regQueue",
  payInQueue: "/payInQueue",
  paymentOutQueue: "/paymentOutQueue",
  transactionQueue: "/transactionQueue",
  txnApiQueue: "/txnApiQueue",
  txnApiReport: "/txnApiReport",
  txnApiDetail: "/txnApiDetail",
  dataAnonQueue: "/dataAnonQueue",
  registrationDetails: "/registrationDetails",
  paymentInDetail: "/paymentInDetail",
  paymentOutDetail: "/paymentOutDetail",
  regReportCriteria: "/regReportCriteria",
  paymentInReportCriteria: "/paymentInReportCriteria",
  paymentOutReportCriteria: "/paymentOutReportCriteria",
  transactionReport: "/transactionReport",
  workEfficiencyReport: "/workEfficiencyReport",
  beneReportApply: "/beneReportApply",
  organizations: "/organizations",
  legalEntities: "/legalEntities",
  currencies: "/currencies",
  velocityRules: "/velocityRules",
} as const;

export function withQuery(
  path: string,
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") {
      continue;
    }
    search.set(key, String(value));
  }
  const query = search.toString();
  return query.length > 0 ? `${path}?${query}` : path;
}
