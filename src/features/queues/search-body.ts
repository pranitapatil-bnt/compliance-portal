import type { QueueQuery, QueueSearchParams } from "./types";

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

export function readQueueQuery(
  searchParams: QueueSearchParams,
  extras: Pick<QueueQuery, "fromReport" | "custType"> = {},
): QueueQuery {
  return {
    keyword: first(searchParams.keyword) || undefined,
    status: first(searchParams.status) || undefined,
    direction: first(searchParams.direction) || undefined,
    ...extras,
  };
}

export function buildQueueSearch(query: QueueQuery = {}) {
  const keyword = query.keyword?.trim() || null;
  const status = query.status?.trim() || null;
  const custType = query.custType?.trim() || null;
  const direction = query.direction?.trim() || null;
  const hasDirection = Boolean(direction && direction !== "ALL");
  const isFilterApply = Boolean(keyword || status || custType || hasDirection);

  const filter: Record<string, unknown> = {
    keyword,
    status: status ? [status] : null,
  };

  if (custType) {
    filter.custType = [custType];
  }
  if (direction) {
    filter.direction = direction;
  }

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
    custType,
  };
}
