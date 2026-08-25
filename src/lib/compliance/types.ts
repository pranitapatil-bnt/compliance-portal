export type JsonObject = Record<string, unknown>;

export type PortalErrorFields = {
  errorCode: string | number | null;
  errorMessage: string | null;
};

export type PortalUser = {
  name: string;
};

export type PageInfo = {
  minRecord: number;
  maxRecord: number;
  currentRecord: number | string | null;
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type QueueFilter = {
  keyword: string | null;
  status: string | string[] | null;
  custType: string | string[] | null;
  organization: string | string[] | null;
  legalEntity: string | string[] | null;
  dateFrom: string | null;
  dateTo: string | null;
  kycStatus: string | string[] | null;
  blacklistStatus: string | string[] | null;
  sanctionStatus: string | string[] | null;
  fraugsterStatus: string | string[] | null;
  customCheckStatus: string | string[] | null;
  watchListStatus: string | string[] | null;
  buyCurrency: string | null;
  sellCurrency: string | null;
  source: string | null;
  transValue: string | null;
  newOrUpdatedRecord: string | string[] | null;
  owner: string | null;
  dateFilterType?: string | string[] | null;
  direction?: string | null;
};

export type QueueSearchRequest = {
  filter: QueueFilter;
  page: PageInfo;
  isFilterApply: boolean;
  isRequestFromReportPage: boolean;
  isLandingPage: boolean;
  custType: string | null;
  saveSearchName?: string;
  pageType?: string;
  isFromClearFilter?: boolean;
};

export type RegistrationQueueItem = {
  tradeAccountNum: string | null;
  registeredOn: string | null;
  contactName: string | null;
  organisation: string | null;
  type: string | null;
  buyCurrency: string | null;
  sellCurrency: string | null;
  source: string | null;
  transactionValue: string | null;
  eidCheck: string | null;
  fraugster: string | null;
  sanction: string | null;
  blacklist: string | null;
  customCheck: string | null;
  contactId: number | null;
  accountId: number | null;
  userResourceLockId: number | null;
  locked: boolean;
  lockedBy: string | null;
  userResourceCreatedOn: string | null;
  userResourceWorkflowTime: string | null;
  userResourceEntityType: string | null;
  totalRecords: number | null;
  countryOfResidence: string | null;
  newOrUpdated: string | null;
  registeredDate: string | null;
  accountVersion: number | null;
  complianceStatus: string | null;
  dataAnonStatus: string | null;
  legalEntity: string | null;
};

export type RegistrationQueueDto = PortalErrorFields & {
  registrationQueue: RegistrationQueueItem[];
  page: Partial<PageInfo>;
  user: PortalUser;
  source: unknown[];
  organization: unknown[];
  currency: unknown[];
  country: unknown[];
  legalEntity: unknown[];
};

export type ProfileUpdateRequest = {
  contactId: number;
  accountId: number;
  accountSfId: string | null;
  contactSfId: string | null;
  orgCode: string | null;
  custType: string | null;
  updatedContactStatus: string | null;
  preContactStatus: string | null;
  updatedAccountStatus: string | null;
  preAccountStatus: string | null;
  comment: string | null;
  contactStatusReasons: unknown[];
  watchlist: unknown[];
  overallWatchlistStatus: boolean;
  complianceDoneOn: string | null;
  registrationInDate: string | null;
  complianceExpiry: string | null;
  complianceLog: string | null;
  isOnQueue: boolean;
  fraugsterEventServiceLogId: number | null;
  userResourceId: number | null;
  createdBy: string | null;
};

export type ActivityLogs = PortalErrorFields & {
  activityLogData: unknown[];
  totalRecords: number;
  user: PortalUser;
  complianceDoneOn: string | null;
  registrationInDate: string | null;
  complianceExpiry: string | null;
  isWatchlistUpdated: boolean;
};

export type LockResourceRequest = {
  id: number;
  lock: boolean;
  userResourceId: number | null;
  resourceType: string;
  resourceId: number;
};

export type LockResourceResponse = PortalErrorFields & {
  lock: boolean;
  status: string;
  resourceId: number;
  userResourceId: number | null;
  lockReleasedOn: string | null;
  name: string | null;
};

export type ActivityLogRequest = {
  entityId: number;
  custType: string | null;
  orgCode: string | null;
  requestType: string | null;
  minRecord: number;
  maxRecord: number;
  noOfRecords: number;
  accountId: number | null;
  rowToFetch: number;
};

export type ViewMoreRequest = {
  contactId?: number;
  entityId: number;
  serviceType: string | null;
  entityType: string | null;
  noOfDisplayRecords: number;
  maxViewRecord: number;
  minViewRecord: number;
  organisation: string | null;
  clientType: string | null;
  accountId: number | null;
  paymentInId?: number;
  paymentOutId?: number;
};

export type ViewMoreResponse = PortalErrorFields & {
  services: unknown[];
  leftRecords: number;
};

export type ProviderResponseRequest = {
  eventServiceLogId: number;
  serviceType: string | null;
};

export type ProviderResponseLogResponse = PortalErrorFields & JsonObject;

export type DeviceInfoRequest = {
  accountId: number;
};

export type DeviceInfoResponse = PortalErrorFields & JsonObject;

export type AccountHistoryRequest = {
  accountId: number;
};

export type AccountHistoryResponse = PortalErrorFields & JsonObject;

export type Contact = {
  contactId?: number;
  accountId?: number;
} & JsonObject;

export type PaymentInQueueItem = {
  transactionId: string | null;
  date: string | null;
  clientId: string | null;
  contactName: string | null;
  type: string | null;
  sellCurrency: string | null;
  amount: string | null;
  method: string | null;
  country: string | null;
  overallStatus: string | null;
  organization: string | null;
  fraugster: string | null;
  sanction: string | null;
  blacklist: string | null;
  watchlist: string | null;
  customCheck: string | null;
  contactId: number | null;
  accountId: number | null;
  paymentInId: string | number | null;
  userResourceLockId: number | null;
  locked: boolean;
  lockedBy: string | null;
  countryFullName: string | null;
  legalEntity: string | null;
  riskStatus: string | null;
  initialStatus: string | null;
  intuitionStatus: string | null;
};

export type PaymentInQueueDto = PortalErrorFields & {
  paymentInQueue: PaymentInQueueItem[];
  page: Partial<PageInfo>;
  user: PortalUser;
};

export type PaymentInUpdateRequest = {
  paymentinId: number;
  updatedPaymentInStatus: string | null;
  prePaymentInStatus: string | null;
  debtorAmount: string | null;
  paymentMethod: string | null;
  tradeContactId: number | null;
  tradeContractNumber: string | null;
  tradePaymentId: number | null;
  custType: string | null;
  buyCurrency: string | null;
  sellCurrency: string | null;
  contactName: string | null;
  statusReason: string | null;
  userName: string | null;
  clientNumber: string | null;
  countryRiskLevel: string | null;
  country: string | null;
  email: string | null;
  legalEntity: string | null;
};

export type PaymentOutQueueItem = {
  paymentOutId: string | number | null;
  transactionId: string | null;
  clientId: string | null;
  date: string | null;
  contactName: string | null;
  type: string | null;
  buyCurrency: string | null;
  amount: string | null;
  beneficiary: string | null;
  country: string | null;
  isoCountry: string | null;
  overallStatus: string | null;
  watchlist: string | null;
  fraugster: string | null;
  sanction: string | null;
  blacklist: string | null;
  customCheck: string | null;
  contactId: number | null;
  accountId: number | null;
  userResourceLockId: number | null;
  locked: boolean;
  lockedBy: string | null;
  organisation: string | null;
  acsfId: string | null;
  reasonOfTransfer: string | null;
  valueDate: string | null;
  maturityDate: string | null;
  legalEntity: string | null;
  initialStatus: string | null;
  blacklistPayRef: string | null;
  intuitionStatus: string | null;
};

export type PaymentOutQueueDto = PortalErrorFields & {
  paymentOutQueue: PaymentOutQueueItem[];
  page: Partial<PageInfo>;
  user: PortalUser;
};

export type PaymentOutUpdateRequest = {
  paymentOutId: number;
  tradeBeneficiayId: number | null;
  updatedPaymentOutStatus: string | null;
  prePaymentOutStatus: string | null;
  beneficiaryName: string | null;
  beneficiaryAmount: string | null;
  beneCheckStatus: string | null;
  tradeContactId: number | null;
  tradeContractNumber: string | null;
  tradePaymentId: number | null;
  custType: string | null;
  buyCurrency: string | null;
  sellCurrency: string | null;
  contactName: string | null;
  statusReason: string | null;
  userName: string | null;
  clientNumber: string | null;
  countryRiskLevel: string | null;
  country: string | null;
  email: string | null;
  legalEntity: string | null;
};

export type TransactionQueueItem = {
  direction: string | null;
  recordId: string | null;
  transactionId: string | null;
  date: string | null;
  clientId: string | null;
  contactName: string | null;
  type: string | null;
  organization: string | null;
  currency: string | null;
  amount: string | null;
  detail: string | null;
  country: string | null;
  overallStatus: string | null;
  watchlist: string | null;
  fraugster: string | null;
  sanction: string | null;
  blacklist: string | null;
  customCheck: string | null;
  contactId: number | null;
  accountId: number | null;
  locked: boolean;
  lockedBy: string | null;
};

export type TransactionQueueDto = {
  transactionQueue: TransactionQueueItem[];
  page: Partial<PageInfo>;
  user: PortalUser;
  errorCode?: string | number | null;
  errorMessage?: string | null;
};

export type TxnApiQueueSearchCriteria = QueueSearchRequest;
export type TxnApiQueueDto = PortalErrorFields & JsonObject;
export type TxnApiUpdateRequest = JsonObject;
export type TxnApiDetailsDto = PortalErrorFields & JsonObject;
export type TransactionReportDto = TransactionQueueDto & JsonObject;
export type WorkEfficiencyReportDto = PortalErrorFields & JsonObject;

export type CrmContactRequest = {
  crmContactId: string;
};

export type FraudRingResponse = PortalErrorFields & JsonObject;
export type FraudRingNode = JsonObject;
export type SocialDataRequest = JsonObject;
export type SocialDataResponse = PortalErrorFields & JsonObject;

export type BeneficiaryReportSearchCriteria = QueueSearchRequest & JsonObject;
export type PayeeResponse = PortalErrorFields & JsonObject;
export type PayeePaymentsRequest = JsonObject;
export type PayeePaymentsResponse = JsonObject;

export type WalletRequest = JsonObject;
export type WalletResponse = PortalErrorFields & JsonObject;
export type FxTicketPortalRequest = JsonObject;
export type FXTicketResponse = PortalErrorFields & JsonObject;
export type CardPilotRequest = JsonObject;
export type CardPilotResponse = PortalErrorFields & JsonObject;

export type VelocityRuleDto = {
  id: number;
  countThreshold?: number;
  amountThreshold?: number;
} & JsonObject;

export type VelocityRuleUpdateRequest = {
  id: number;
  countThreshold: number;
  amountThreshold: number;
};

export type OrganizationDto = {
  id: number;
  code: string;
  name: string;
};

export type LegalEntityDto = {
  id?: number;
  code?: string;
  name?: string;
} & JsonObject;

export type CurrencyDto = {
  id?: number;
  code?: string;
  name?: string;
} & JsonObject;

export type ClientOnboardingRequest = {
  organizationCode: string;
  organizationName: string;
  locked: boolean;
  existingLegalEntityIds: number[];
  newLegalEntities: unknown[];
  velocityRules: unknown[];
  alertEmail: string | null;
  enableTitan: boolean;
  createOwnKycProvider: boolean;
  createOwnSanctionProvider: boolean;
};

export type ClientOnboardingResponse = {
  success: boolean;
  organizationId: number;
  organizationCode: string;
  organizationName: string;
  createdLegalEntityCodes: string[];
  linkedLegalEntityCodes: string[];
  velocityRulesCreated: number;
  serviceProvidersCreated: string[];
  pendingConfigNotes: string[];
};

export type RepeatCheckRequest = {
  moduleName: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  batchId: number | null;
  transTypeInteger: number | null;
};

export type BaseRepeatCheckResponse = PortalErrorFields & JsonObject;
export type BaseResponse = PortalErrorFields & JsonObject;

export type DataAnonymisationSearchCriteria = QueueSearchRequest & JsonObject;
export type DataAnonymisationDataRequest = JsonObject;
export type DataAnonymisationDto = PortalErrorFields & JsonObject;
export type DataAnonymisationResponse = PortalErrorFields & JsonObject;

export type SavedSearchRequest = QueueSearchRequest & {
  saveSearchName: string;
  pageType: string;
  isFromClearFilter: boolean;
};

export type BffErrorBody = {
  error: string;
  unauthenticated?: boolean;
  errorCode?: string | number | null;
};
