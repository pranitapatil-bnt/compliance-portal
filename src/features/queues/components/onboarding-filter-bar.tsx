import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";
import { asRoute } from "@/lib/utils/routes";

import { datePresets } from "../date-presets";
import type { QueueQuery } from "../types";

const statuses = ["Active", "Inactive", "Rejected"] as const;

function PassIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
      <path d="M6.4 10.6 3.8 8l1-1 1.6 1.6 4.8-4.8 1 1z" fill="currentColor" />
    </svg>
  );
}

function FailIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
      <path
        d="m11.4 5-2.4 2.4L11.4 9.8 10.4 10.8 8 8.4 5.6 10.8 4.6 9.8 7 7.4 4.6 5 5.6 4 8 6.4 10.4 4z"
        fill="currentColor"
      />
    </svg>
  );
}

const segmentClass =
  "cursor-pointer whitespace-nowrap px-2.5 py-1.5 text-[12px] font-medium text-[#6b7785] has-[:checked]:font-semibold has-[:checked]:text-[#2c3a4a]";

const selectClass =
  "h-[34px] w-full appearance-none rounded-md border border-[#d5dde5] bg-white px-3 pr-8 text-[13px] text-[#2c3a4a] focus:border-[#7eb3e0] focus:outline-none";

const selectArrow = {
  backgroundImage:
    "linear-gradient(45deg, transparent 50%, #7b8794 50%), linear-gradient(135deg, #7b8794 50%, transparent 50%)",
  backgroundPosition: "calc(100% - 14px) 14px, calc(100% - 9px) 14px",
  backgroundSize: "5px 5px, 5px 5px",
  backgroundRepeat: "no-repeat",
} as const;

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="mb-1.5 block text-[11px] font-medium text-[#8b95a1]">
      {children}
    </span>
  );
}

function Divider() {
  return <span className="mb-1 h-8 w-px shrink-0 self-end bg-[#dce3ea]" />;
}

function CheckPair({
  name,
  legend,
  value,
}: {
  name: string;
  legend: string;
  value?: string;
}) {
  return (
    <fieldset className="min-w-0">
      <FieldLabel>{legend}</FieldLabel>
      <div className="inline-flex h-[34px] overflow-hidden rounded-md border border-[#d5dde5] bg-white">
        <label
          title="Pass"
          className="flex cursor-pointer items-center justify-center px-2 text-[#22a05a] has-[:checked]:bg-[#e8f8ee]"
        >
          <input
            type="radio"
            name={name}
            value="PASS"
            defaultChecked={value === "PASS"}
            className="sr-only"
          />
          <PassIcon />
        </label>
        <label
          title="Fail"
          className="flex cursor-pointer items-center justify-center px-2 text-[#e25555] has-[:checked]:bg-[#fdecec]"
        >
          <input
            type="radio"
            name={name}
            value="FAIL"
            defaultChecked={value === "FAIL"}
            className="sr-only"
          />
          <FailIcon />
        </label>
      </div>
    </fieldset>
  );
}

type OnboardingFilterBarProps = {
  query: QueueQuery;
  organizations?: string[];
  action?: string;
};

export function OnboardingFilterBar({
  query,
  organizations = [],
  action = routes.reg,
}: OnboardingFilterBarProps) {
  const pickedOrgs = query.organizations ?? [];
  const orgLabel =
    pickedOrgs.length === 0
      ? "Select"
      : pickedOrgs.length === 1
        ? pickedOrgs[0]
        : `${pickedOrgs.length} selected`;
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
          <button
            type="button"
            disabled
            className="inline-flex h-[34px] items-center justify-center rounded-md border border-[#d5dde5] bg-white px-3.5 text-sm font-medium text-[#2c3a4a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            disabled
            className="inline-flex h-[34px] items-center justify-center rounded-md border border-[#d5dde5] bg-white px-3.5 text-sm font-medium text-[#b0b7c0] disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-nowrap items-end gap-3 overflow-visible">
        <fieldset className="shrink-0">
          <FieldLabel>Status</FieldLabel>
          <div className="inline-flex h-[34px] items-center overflow-hidden rounded-md bg-[#eef3f7]">
            {statuses.map((status) => (
              <label key={status} className={segmentClass}>
                <input
                  type="checkbox"
                  name="status"
                  value={status}
                  defaultChecked={query.statuses?.includes(status)}
                  className="sr-only"
                />
                {status}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="relative w-[128px] shrink-0">
          <FieldLabel>Organizations</FieldLabel>
          <details>
            <summary
              className={cn(
                selectClass,
                "flex cursor-pointer list-none items-center justify-between pr-3 [&::-webkit-details-marker]:hidden",
              )}
            >
              <span className="truncate text-[#6b7785]">{orgLabel}</span>
              <span
                aria-hidden="true"
                className="ml-2 text-[10px] text-[#7b8794]"
              >
                ▾
              </span>
            </summary>
            <div className="absolute top-full left-0 z-20 mt-1 min-w-[12rem] rounded-md border border-[#d5dde5] bg-white py-1 shadow-[0_12px_28px_rgba(15,40,70,0.12)]">
              {organizations.length === 0 ? (
                <p className="px-3 py-2 text-xs text-[#7b8794]">
                  No organizations
                </p>
              ) : (
                organizations.map((organization) => (
                  <label
                    key={organization}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-[#2c3a4a] hover:bg-[#f3f8fd]"
                  >
                    <input
                      type="checkbox"
                      name="organization"
                      value={organization}
                      defaultChecked={pickedOrgs.includes(organization)}
                      className="size-3.5 rounded border-[#c5ced8] accent-[#3d7ec4]"
                    />
                    {organization}
                  </label>
                ))
              )}
            </div>
          </details>
        </div>

        <fieldset className="shrink-0">
          <FieldLabel>New or Updated</FieldLabel>
          <div className="inline-flex h-[34px] items-center overflow-hidden rounded-md bg-[#eef3f7]">
            {(["New", "Updated"] as const).map((item) => (
              <label key={item} className={segmentClass}>
                <input
                  type="radio"
                  name="newOrUpdated"
                  value={item}
                  defaultChecked={query.newOrUpdated === item}
                  className="sr-only"
                />
                {item}
              </label>
            ))}
          </div>
        </fieldset>

        <Divider />

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
          <CheckPair name="kycStatus" legend="EID" value={query.kycStatus} />
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
