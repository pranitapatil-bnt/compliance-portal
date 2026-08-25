export type CheckStatus = "pass" | "fail" | "na" | "pending";

export type QueueRow = {
  id: string;
  cells: string[];
  locked?: boolean;
  owned?: boolean;
  lockedBy?: string;
  contactId?: string;
  type?: string;
  href?: string;
  status?: string;
};

export type QueueResult = {
  rows: QueueRow[];
  total: number;
  error?: string;
  organizations?: string[];
};

export type QueueQuery = {
  keyword?: string;
  status?: string;
  statuses?: string[];
  organizations?: string[];
  dateFrom?: string;
  dateTo?: string;
  dateFilterType?: string;
  newOrUpdated?: string;
  kycStatus?: string;
  fraugsterStatus?: string;
  sanctionStatus?: string;
  blacklistStatus?: string;
  customCheckStatus?: string;
  watchListStatus?: string;
  custType?: string;
  custTypes?: string[];
  direction?: string;
  fromReport?: boolean;
  maxRecord?: number;
};

export type QueueSearchParams = {
  keyword?: string | string[];
  status?: string | string[];
  organization?: string | string[];
  dateFrom?: string | string[];
  dateTo?: string | string[];
  dateFilterType?: string | string[];
  newOrUpdated?: string | string[];
  kycStatus?: string | string[];
  fraugsterStatus?: string | string[];
  sanctionStatus?: string | string[];
  blacklistStatus?: string | string[];
  customCheckStatus?: string | string[];
  watchListStatus?: string | string[];
  custType?: string | string[];
  direction?: string | string[];
};
