import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";
import { asRoute } from "@/lib/utils/routes";

import {
  CheckPair,
  Divider,
  FieldLabel,
  selectArrow,
  selectClass,
} from "./filter-bar-controls";
import { datePresets } from "../date-presets";
import type { QueueQuery } from "../types";

const statuses = ["HOLD", "FAILED", "CLEARED", "REJECTED"] as const;

type TransactionFilterBarProps = {
  query: QueueQuery;
  action?: string;
};

export function TransactionFilterBar({
  query,
  action = routes.txnApi,
}: TransactionFilterBarProps) {
  const showCustomDates = query.dateFilterType === "Custom";

  return (
    <form
      method="GET"
      action={asRoute(action)}
      className="rounded-lg border border-[#dce3ea] bg-white px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-[#2c3a4a]">
          Search filters
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={asRoute(action)}
            className="inline-flex h-[34px] items-center justify-center rounded-md border border-[#d5dde5] bg-white px-3.5 text-sm font-medium text-[#3d7ec4] hover:bg-[#f7f9fb]"
          >
            Clear
          </a>
          <button
            type="submit"
            className="inline-flex h-[34px] items-center justify-center rounded-md bg-[#3d7ec4] px-3.5 text-sm font-medium text-white hover:bg-[#3269a8]"
          >
            Generate
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-nowrap items-end gap-3 overflow-visible">
        <label className="w-[240px] shrink-0">
          <FieldLabel>Keyword</FieldLabel>
          <input
            type="search"
            name="keyword"
            defaultValue={query.keyword ?? ""}
            placeholder="Payment ID, contract, client..."
            className="h-[34px] w-full rounded-md border border-[#d5dde5] bg-white px-3 text-[13px] text-[#2c3a4a] placeholder:text-[#9aa3b2] focus:border-[#7eb3e0] focus:outline-none"
          />
        </label>

        <label className="w-[150px] shrink-0">
          <FieldLabel>Status</FieldLabel>
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className={cn(selectClass, "text-[#6b7785]")}
            style={selectArrow}
          >
            <option value="">Please select</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "FAILED" ? "Failed" : status}
              </option>
            ))}
          </select>
        </label>

        <label className="w-[150px] shrink-0">
          <select
            name="dateFilterType"
            defaultValue={query.dateFilterType ?? ""}
            className={cn(selectClass, "text-[#6b7785]")}
            style={selectArrow}
          >
            <option value="">Select period</option>
            {datePresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        {showCustomDates ? (
          <>
            <label className="shrink-0">
              <input
                name="dateFrom"
                defaultValue={query.dateFrom ?? ""}
                placeholder="From"
                className="h-[34px] w-[92px] rounded-md border border-[#d5dde5] bg-white px-2 text-[12px] text-[#2c3a4a]"
              />
            </label>
            <label className="shrink-0">
              <input
                name="dateTo"
                defaultValue={query.dateTo ?? ""}
                placeholder="To"
                className="h-[34px] w-[92px] rounded-md border border-[#d5dde5] bg-white px-2 text-[12px] text-[#2c3a4a]"
              />
            </label>
          </>
        ) : null}

        <Divider />

        <div className="flex shrink-0 flex-nowrap items-end gap-2 rounded-md border border-[#e4eaf0] px-2.5 pt-1 pb-1.5">
          <CheckPair
            name="fraugsterStatus"
            legend="FP"
            value={query.fraugsterStatus}
          />
          <CheckPair
            name="sanctionStatus"
            legend="Sanc"
            value={query.sanctionStatus}
          />
          <CheckPair
            name="blacklistStatus"
            legend="BL"
            value={query.blacklistStatus}
          />
          <CheckPair
            name="customCheckStatus"
            legend="Custom"
            value={query.customCheckStatus}
          />
        </div>
      </div>
    </form>
  );
}
