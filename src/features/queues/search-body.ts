import type { QueueQuery, QueueSearchParams } from "./types";

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

function all(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter((item) => item.length > 0);
  }
  const single = value?.trim() ?? "";
  return single.length > 0 ? [single] : [];
}

export function readQueueQuery(
  searchParams: QueueSearchParams,
  extras: Pick<QueueQuery, "fromReport" | "custType"> = {},
): QueueQuery {
  return {
    keyword: first(searchParams.keyword) || undefined,
    status: first(searchParams.status) || undefined,
    statuses: all(searchParams.status),
    organizations: all(searchParams.organization),
    dateFrom: first(searchParams.dateFrom) || undefined,
    dateTo: first(searchParams.dateTo) || undefined,
    dateFilterType: first(searchParams.dateFilterType) || undefined,
    newOrUpdated: first(searchParams.newOrUpdated) || undefined,
    kycStatus: first(searchParams.kycStatus) || undefined,
    fraugsterStatus: first(searchParams.fraugsterStatus) || undefined,
    sanctionStatus: first(searchParams.sanctionStatus) || undefined,
    blacklistStatus: first(searchParams.blacklistStatus) || undefined,
    customCheckStatus: first(searchParams.customCheckStatus) || undefined,
    direction: first(searchParams.direction) || undefined,
    ...extras,
  };
}

function putList(
  filter: Record<string, unknown>,
  key: string,
  values?: string[] | null,
) {
  if (values && values.length > 0) {
    filter[key] = values;
  }
}

function putValue(
  filter: Record<string, unknown>,
  key: string,
  value?: string | null,
) {
  const trimmed = value?.trim();
  if (trimmed) {
    filter[key] = trimmed;
  }
}

export function buildQueueSearch(query: QueueQuery = {}) {
  const keyword = query.keyword?.trim() || undefined;
  const statuses = query.statuses?.length
    ? query.statuses
    : query.status
      ? [query.status]
      : undefined;
  const organizations = query.organizations;
  const dateFrom = query.dateFrom?.trim() || undefined;
  const dateTo = query.dateTo?.trim() || undefined;
  const dateFilterType = query.dateFilterType?.trim() || undefined;
  const newOrUpdated = query.newOrUpdated?.trim() || undefined;
  const kycStatus = query.kycStatus?.trim() || undefined;
  const fraugsterStatus = query.fraugsterStatus?.trim() || undefined;
  const sanctionStatus = query.sanctionStatus?.trim() || undefined;
  const blacklistStatus = query.blacklistStatus?.trim() || undefined;
  const customCheckStatus = query.customCheckStatus?.trim() || undefined;
  const custType = query.custType?.trim() || undefined;
  const direction = query.direction?.trim() || undefined;
  const hasDirection = Boolean(direction && direction !== "ALL");
  const isFilterApply = Boolean(
    keyword ||
    statuses?.length ||
    organizations?.length ||
    dateFrom ||
    dateTo ||
    dateFilterType ||
    newOrUpdated ||
    kycStatus ||
    fraugsterStatus ||
    sanctionStatus ||
    blacklistStatus ||
    customCheckStatus ||
    custType ||
    hasDirection,
  );

  const filter: Record<string, unknown> = {};
  putValue(filter, "keyword", keyword);
  putList(filter, "status", statuses);
  putList(filter, "organization", organizations);
  putValue(filter, "dateFrom", dateFrom);
  putValue(filter, "dateTo", dateTo);
  putList(
    filter,
    "dateFilterType",
    dateFilterType ? [dateFilterType] : undefined,
  );
  putList(
    filter,
    "newOrUpdatedRecord",
    newOrUpdated ? [newOrUpdated] : undefined,
  );
  putList(filter, "kycStatus", kycStatus ? [kycStatus] : undefined);
  putList(
    filter,
    "fraugsterStatus",
    fraugsterStatus ? [fraugsterStatus] : undefined,
  );
  putList(
    filter,
    "sanctionStatus",
    sanctionStatus ? [sanctionStatus] : undefined,
  );
  putList(
    filter,
    "blacklistStatus",
    blacklistStatus ? [blacklistStatus] : undefined,
  );
  putList(
    filter,
    "customCheckStatus",
    customCheckStatus ? [customCheckStatus] : undefined,
  );
  putList(filter, "custType", custType ? [custType] : undefined);
  putValue(filter, "direction", hasDirection ? direction : undefined);

  return {
    filter,
    page: {
      currentPage: 1,
      minRecord: 1,
      maxRecord: 50,
      totalRecords: 0,
      totalPages: 0,
    },
    isFilterApply,
    isRequestFromReportPage: Boolean(query.fromReport),
    isLandingPage: Boolean(query.fromReport) && !isFilterApply,
    custType: custType ?? null,
  };
}
