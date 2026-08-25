import "server-only";

import {
  portalApiGet,
  portalApiHtml,
  portalApiPost,
  portalApiPostHtml,
} from "@/lib/api/client";
import type { PortalCallOptions } from "@/lib/api/client";

import { compliancePath, withQuery } from "./paths";
import { withQueueDefaults } from "./search";
import type {
  AccountHistoryRequest,
  AccountHistoryResponse,
  ActivityLogRequest,
  ActivityLogs,
  BaseRepeatCheckResponse,
  BaseResponse,
  CardPilotRequest,
  CardPilotResponse,
  ClientOnboardingRequest,
  ClientOnboardingResponse,
  Contact,
  CrmContactRequest,
  CurrencyDto,
  DataAnonymisationDataRequest,
  DataAnonymisationDto,
  DataAnonymisationResponse,
  DataAnonymisationSearchCriteria,
  DeviceInfoRequest,
  DeviceInfoResponse,
  FraudRingNode,
  FraudRingResponse,
  FXTicketResponse,
  FxTicketPortalRequest,
  JsonObject,
  LegalEntityDto,
  LockResourceRequest,
  LockResourceResponse,
  OrganizationDto,
  PayeePaymentsRequest,
  PayeePaymentsResponse,
  PayeeResponse,
  PaymentInQueueDto,
  PaymentInUpdateRequest,
  PaymentOutQueueDto,
  PaymentOutUpdateRequest,
  ProfileUpdateRequest,
  ProviderResponseLogResponse,
  ProviderResponseRequest,
  QueueSearchRequest,
  RegistrationQueueDto,
  RepeatCheckRequest,
  SavedSearchRequest,
  SocialDataRequest,
  SocialDataResponse,
  TransactionQueueDto,
  TxnApiDetailsDto,
  TxnApiQueueDto,
  TxnApiQueueSearchCriteria,
  TxnApiUpdateRequest,
  VelocityRuleDto,
  VelocityRuleUpdateRequest,
  ViewMoreRequest,
  ViewMoreResponse,
  WalletRequest,
  WalletResponse,
  WorkEfficiencyReportDto,
} from "./types";

type CallOptions = PortalCallOptions;

function getJson<T>(path: string, options?: CallOptions): Promise<T> {
  return portalApiGet(path, options) as Promise<T>;
}

function postJson<T>(
  path: string,
  payload?: unknown,
  options?: CallOptions,
): Promise<T> {
  return portalApiPost(path, payload, options) as Promise<T>;
}

function queueBody(body?: Partial<QueueSearchRequest> | null) {
  return withQueueDefaults(body);
}

export const complianceApi = {
  dashboardPage: (options?: CallOptions) =>
    portalApiHtml(compliancePath.dashboard, options),
  registrationDetailsPage: (
    query: {
      contactId: string | number;
      custType?: string;
      source?: string;
      searchCriteria?: string;
    },
    options?: CallOptions,
  ) =>
    portalApiPostHtml(
      withQuery(compliancePath.registrationDetails, {
        contactId: query.contactId,
        custType: query.custType ?? "PERSONAL",
        source: query.source ?? "QUEUE",
        searchCriteria: query.searchCriteria,
      }),
      options,
    ),
  paymentInDetailPage: (
    query: {
      paymentInId: string | number;
      custType?: string;
      source?: string;
    },
    options?: CallOptions,
  ) =>
    portalApiPostHtml(
      withQuery(compliancePath.paymentInDetail, {
        paymentInId: query.paymentInId,
        custType: query.custType ?? "PERSONAL",
        source: query.source ?? "QUEUE",
      }),
      options,
    ),
  paymentOutDetailPage: (
    query: { paymentOutId: string | number; source?: string },
    options?: CallOptions,
  ) =>
    portalApiPostHtml(
      withQuery(compliancePath.paymentOutDetail, {
        paymentOutId: query.paymentOutId,
        source: query.source ?? "QUEUE",
      }),
      options,
    ),
  txnApiDetailPage: (
    query: { transactionId: string; source?: string },
    options?: CallOptions,
  ) =>
    portalApiPostHtml(
      withQuery(compliancePath.txnApiDetail, {
        transactionId: query.transactionId,
        source: query.source ?? "QUEUE",
      }),
      options,
    ),
  organizations: (options?: CallOptions) =>
    getJson<OrganizationDto[]>(compliancePath.organizations, options),
  legalEntities: (options?: CallOptions) =>
    getJson<LegalEntityDto[]>(compliancePath.legalEntities, options),
  currencies: (options?: CallOptions) =>
    getJson<CurrencyDto[]>(compliancePath.currencies, options),
  velocityRules: (options?: CallOptions) =>
    getJson<VelocityRuleDto[]>(compliancePath.velocityRules, options),
  showCountReprocessFailed: (batchId: number | string, options?: CallOptions) =>
    getJson<string>(`/showCountReprocessFailed?batchId=${batchId}`, options),
  clearReprocessFailed: (options?: CallOptions) =>
    getJson<number>("/clearReprocessFailed", options),

  regQueue: (body?: Partial<QueueSearchRequest>, options?: CallOptions) =>
    postJson<RegistrationQueueDto>(
      compliancePath.regQueue,
      queueBody(body),
      options,
    ),
  profileUpdate: (body: ProfileUpdateRequest, options?: CallOptions) =>
    postJson<ActivityLogs>("/profileUpdate", body, options),
  lockResource: (body: LockResourceRequest, options?: CallOptions) =>
    postJson<LockResourceResponse>("/lockResource", body, options),
  lockResourceMultiContact: (
    body: LockResourceRequest,
    options?: CallOptions,
  ) =>
    postJson<LockResourceResponse>("/lockResourceMultiContact", body, options),
  regActivites: (body: ActivityLogRequest, options?: CallOptions) =>
    postJson<ActivityLogs>("/regActivites", body, options),
  viewMoreDetails: (body: ViewMoreRequest, options?: CallOptions) =>
    postJson<ViewMoreResponse>("/viewMoreDetails", body, options),
  getProviderResponse: (body: ProviderResponseRequest, options?: CallOptions) =>
    postJson<ProviderResponseLogResponse>(
      "/getProviderResponse",
      body,
      options,
    ),
  getDeviceInfo: (body: DeviceInfoRequest, options?: CallOptions) =>
    postJson<DeviceInfoResponse>("/getDeviceInfo", body, options),
  getAccountHistory: (body: AccountHistoryRequest, options?: CallOptions) =>
    postJson<AccountHistoryResponse>("/getAccountHistory", body, options),
  setPoiExistsFlag: (body: Contact, options?: CallOptions) =>
    postJson<boolean>("/setPoiExistsFlag", body, options),

  payInQueue: (body?: Partial<QueueSearchRequest>, options?: CallOptions) =>
    postJson<PaymentInQueueDto>(
      compliancePath.payInQueue,
      queueBody(body),
      options,
    ),
  paymentInUpdate: (body: PaymentInUpdateRequest, options?: CallOptions) =>
    postJson<ActivityLogs>("/paymentInUpdate", body, options),
  paymentInActivites: (body: ActivityLogRequest, options?: CallOptions) =>
    postJson<ActivityLogs>("/paymentInActivites", body, options),
  getPaymentInViewMoreDetails: (body: ViewMoreRequest, options?: CallOptions) =>
    postJson<ViewMoreResponse>("/getPaymentInViewMoreDetails", body, options),
  setPoiExistsFlagForPaymentIn: (body: Contact, options?: CallOptions) =>
    postJson<boolean>("/setPoiExistsFlagForPaymentIn", body, options),

  paymentOutQueue: (
    body?: Partial<QueueSearchRequest>,
    options?: CallOptions,
  ) =>
    postJson<PaymentOutQueueDto>(
      compliancePath.paymentOutQueue,
      queueBody(body),
      options,
    ),
  paymentOutUpdate: (body: PaymentOutUpdateRequest, options?: CallOptions) =>
    postJson<ActivityLogs>("/paymentOutUpdate", body, options),
  paymentOutActivites: (body: ActivityLogRequest, options?: CallOptions) =>
    postJson<ActivityLogs>("/paymentOutActivites", body, options),
  getPaymentOutViewMoreDetails: (
    body: ViewMoreRequest,
    options?: CallOptions,
  ) =>
    postJson<ViewMoreResponse>("/getPaymentOutViewMoreDetails", body, options),
  getFurtherPaymentOutDetails: (body: ViewMoreRequest, options?: CallOptions) =>
    postJson<ViewMoreResponse>("/getFurtherPaymentOutDetails", body, options),
  setPoiExistsFlagForPaymentOut: (body: Contact, options?: CallOptions) =>
    postJson<boolean>("/setPoiExistsFlagForPaymentOut", body, options),

  transactionQueue: (
    body?: Partial<QueueSearchRequest>,
    options?: CallOptions,
  ) =>
    postJson<TransactionQueueDto>(
      compliancePath.transactionQueue,
      queueBody(body),
      options,
    ),
  txnApiQueue: (
    body?: Partial<TxnApiQueueSearchCriteria>,
    options?: CallOptions,
  ) =>
    postJson<TxnApiQueueDto>(
      compliancePath.txnApiQueue,
      queueBody(body),
      options,
    ),
  txnApiReport: (
    body?: Partial<TxnApiQueueSearchCriteria>,
    options?: CallOptions,
  ) =>
    postJson<TxnApiQueueDto>(
      compliancePath.txnApiReport,
      queueBody(body),
      options,
    ),
  txnApiDetails: (
    body: { transactionId: string; source?: string } & JsonObject,
    options?: CallOptions,
  ) =>
    postJson<TxnApiDetailsDto>(compliancePath.txnApiDetails, body, options),
  txnApiUpdate: (body: TxnApiUpdateRequest, options?: CallOptions) =>
    postJson<TxnApiDetailsDto>("/txnApiUpdate", body, options),

  regReportCriteria: (
    body?: Partial<QueueSearchRequest>,
    options?: CallOptions,
  ) =>
    postJson<RegistrationQueueDto>(
      compliancePath.regReportCriteria,
      queueBody(body),
      options,
    ),
  paymentInReportCriteria: (
    body?: Partial<QueueSearchRequest>,
    options?: CallOptions,
  ) =>
    postJson<PaymentInQueueDto>(
      compliancePath.paymentInReportCriteria,
      queueBody(body),
      options,
    ),
  paymentOutReportCriteria: (
    body?: Partial<QueueSearchRequest>,
    options?: CallOptions,
  ) =>
    postJson<PaymentOutQueueDto>(
      compliancePath.paymentOutReportCriteria,
      queueBody(body),
      options,
    ),
  transactionReport: (
    body?: Partial<QueueSearchRequest>,
    options?: CallOptions,
  ) =>
    postJson<TransactionQueueDto>(
      compliancePath.transactionReport,
      queueBody(body),
      options,
    ),
  workEfficiencyReport: (
    body?: Partial<QueueSearchRequest>,
    options?: CallOptions,
  ) =>
    postJson<WorkEfficiencyReportDto>(
      compliancePath.workEfficiencyReport,
      queueBody(body),
      options,
    ),

  getPaymentInActivityLogs: (body: ActivityLogRequest, options?: CallOptions) =>
    postJson<ActivityLogs>("/getPaymentInActivityLogs", body, options),
  getPaymentOutActivityLogs: (
    body: ActivityLogRequest,
    options?: CallOptions,
  ) => postJson<ActivityLogs>("/getPaymentOutActivityLogs", body, options),
  getRegistrationActivityLogs: (
    body: ActivityLogRequest,
    options?: CallOptions,
  ) => postJson<ActivityLogs>("/getRegistrationActivityLogs", body, options),
  getAllActivityLogs: (body: ActivityLogRequest, options?: CallOptions) =>
    postJson<ActivityLogs>("/getAllActivityLogs", body, options),

  getFraudRingDetails: (body: CrmContactRequest, options?: CallOptions) =>
    postJson<FraudRingResponse>("/getFraudRingDetails", body, options),
  checkIsFraudRingPresent: (body: CrmContactRequest, options?: CallOptions) =>
    postJson<boolean>("/checkIsFraudRingPresent", body, options),
  getNodeDetails: (body: CrmContactRequest, options?: CallOptions) =>
    postJson<FraudRingNode>("/getNodeDetails", body, options),
  getSocialData: (body: SocialDataRequest, options?: CallOptions) =>
    postJson<SocialDataResponse>("/getSocialData", body, options),

  beneReportApply: (
    body?: Partial<QueueSearchRequest>,
    options?: CallOptions,
  ) =>
    postJson<PayeeResponse>(
      compliancePath.beneReportApply,
      queueBody(body),
      options,
    ),
  getBeneficiaryListOfClient: (accountId: string, options?: CallOptions) =>
    postJson<PayeeResponse>("/getBeneficiaryListOfClient", accountId, options),
  getTransactionList: (body: PayeePaymentsRequest, options?: CallOptions) =>
    postJson<PayeePaymentsResponse[]>("/getTransactionList", body, options),

  getCustomerAllWalletList: (body: WalletRequest, options?: CallOptions) =>
    postJson<WalletResponse>("/getCustomerAllWalletList", body, options),
  getCustomerFXTicketList: (
    body: FxTicketPortalRequest,
    options?: CallOptions,
  ) => postJson<FXTicketResponse>("/getCustomerFXTicketList", body, options),
  getCardPilotList: (body: CardPilotRequest, options?: CallOptions) =>
    postJson<CardPilotResponse>("/getCardPilotList", body, options),

  updateVelocityRules: (
    body: VelocityRuleUpdateRequest,
    options?: CallOptions,
  ) => postJson<boolean>("/velocityRules/update", body, options),
  clientOnboarding: (body: ClientOnboardingRequest, options?: CallOptions) =>
    postJson<ClientOnboardingResponse>("/clientOnboarding", body, options),

  recheckRegistration: (body: RepeatCheckRequest, options?: CallOptions) =>
    postJson<BaseRepeatCheckResponse>("/recheckRegistration", body, options),
  recheckFundsIn: (body: RepeatCheckRequest, options?: CallOptions) =>
    postJson<BaseRepeatCheckResponse>("/recheckFundsIn", body, options),
  recheckFundsOut: (body: RepeatCheckRequest, options?: CallOptions) =>
    postJson<BaseRepeatCheckResponse>("/recheckFundsOut", body, options),
  registrationServiceFailureCount: (
    body: RepeatCheckRequest,
    options?: CallOptions,
  ) =>
    postJson<BaseRepeatCheckResponse>(
      "/registrationServiceFailureCount",
      body,
      options,
    ),
  fundsInServiceFailureCount: (
    body: RepeatCheckRequest,
    options?: CallOptions,
  ) =>
    postJson<BaseRepeatCheckResponse>(
      "/fundsInServiceFailureCount",
      body,
      options,
    ),
  fundsOutServiceFailureCount: (
    body: RepeatCheckRequest,
    options?: CallOptions,
  ) =>
    postJson<BaseRepeatCheckResponse>(
      "/fundsOutServiceFailureCount",
      body,
      options,
    ),
  forceClearFundsIn: (body: RepeatCheckRequest, options?: CallOptions) =>
    postJson<BaseRepeatCheckResponse>("/forceClearFundsIn", body, options),
  forceClearFundsOuts: (body: RepeatCheckRequest, options?: CallOptions) =>
    postJson<BaseRepeatCheckResponse>("/forceClearFundsOuts", body, options),
  repeatCheckProgressBar: (body: RepeatCheckRequest, options?: CallOptions) =>
    postJson<number>("/repeatCheckProgressBar", body, options),
  deleteReprocessFailed: (body: RepeatCheckRequest, options?: CallOptions) =>
    postJson<number>("/deleteReprocessFailed", body, options),
  updateTMMQRetryCount: (options?: CallOptions) =>
    postJson<boolean>("/updateTMMQRetryCount", undefined, options),
  updatePostCardTMMQRetryCount: (options?: CallOptions) =>
    postJson<boolean>("/updatePostCardTMMQRetryCount", undefined, options),
  syncRegWithIntuition: (accountIds: string[], options?: CallOptions) =>
    postJson<BaseResponse>("/syncRegWithIntuition", accountIds, options),

  dataAnonQueue: (
    body?: Partial<DataAnonymisationSearchCriteria>,
    options?: CallOptions,
  ) =>
    postJson<DataAnonymisationDto>(
      compliancePath.dataAnonQueue,
      queueBody(body),
      options,
    ),
  getDataAnonymize: (
    body: DataAnonymisationDataRequest,
    options?: CallOptions,
  ) => postJson<boolean>("/getDataAnonymize", body, options),
  updateDataAnon: (body: DataAnonymisationDataRequest, options?: CallOptions) =>
    postJson<DataAnonymisationResponse>("/updateDataAnon", body, options),
  cancelDataAnon: (body: DataAnonymisationDataRequest, options?: CallOptions) =>
    postJson<boolean>("/cancelDataAnon", body, options),
  getDataAnonHistory: (
    body: DataAnonymisationDataRequest,
    options?: CallOptions,
  ) => postJson<DataAnonymisationDto>("/getDataAnonHistory", body, options),

  savedSearch: (body: SavedSearchRequest, options?: CallOptions) =>
    postJson<boolean>("/savedSearch", body, options),
  updateSavedSearch: (body: SavedSearchRequest, options?: CallOptions) =>
    postJson<boolean>("/updateSavedSearch", body, options),
  deleteSavedSearch: (body: SavedSearchRequest, options?: CallOptions) =>
    postJson<boolean>("/deleteSavedSearch", body, options),
};
