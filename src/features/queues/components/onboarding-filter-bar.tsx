"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

import type { QueueQuery } from "../types";

const statuses = ["Active", "Inactive", "Rejected"] as const;

const datePresets = [
  { value: "Today", label: "Today" },
  { value: "Yesterday", label: "Yesterday" },
  { value: "ThisWeek", label: "This Week" },
  { value: "ThisMonth", label: "This Month" },
  { value: "ThisYear", label: "This Year" },
  { value: "Custom", label: "Custom" },
] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function datesForPreset(preset: string): { from: string; to: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (preset === "Yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const value = formatDate(yesterday);
    return { from: value, to: value };
  }
  if (preset === "ThisWeek") {
    const start = new Date(today);
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    return { from: formatDate(start), to: formatDate(today) };
  }
  if (preset === "ThisMonth") {
    return {
      from: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      to: formatDate(today),
    };
  }
  if (preset === "ThisYear") {
    return {
      from: formatDate(new Date(today.getFullYear(), 0, 1)),
      to: formatDate(today),
    };
  }
  if (preset === "Today") {
    const value = formatDate(today);
    return { from: value, to: value };
  }
  return { from: "", to: "" };
}

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
};

export function OnboardingFilterBar({
  query,
  organizations = [],
}: OnboardingFilterBarProps) {
  const pathname = usePathname();
  const orgRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [orgOpen, setOrgOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(query.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(query.dateTo ?? "");
  const [period, setPeriod] = useState(query.dateFilterType ?? "");
  const [pickedOrgs, setPickedOrgs] = useState<string[]>(
    query.organizations ?? [],
  );
  const selectedOrgs = useMemo(() => new Set(pickedOrgs), [pickedOrgs]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!orgRef.current?.contains(event.target as Node)) {
        setOrgOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function applyPreset(next: string) {
    setPeriod(next);
    const range = datesForPreset(next);
    setDateFrom(range.from);
    setDateTo(range.to);
  }

  const orgLabel =
    pickedOrgs.length === 0
      ? "Select"
      : pickedOrgs.length === 1
        ? pickedOrgs[0]
        : `${pickedOrgs.length} selected`;

  return (
    <form className="rounded-lg border border-[#dce3ea] bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#2c3a4a]"
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-block text-xs text-[#7b8794] transition-transform",
              !open && "rotate-180",
            )}
          >
            ▴
          </span>
          Search filters
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={pathname}
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

      {open ? (
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

          <div ref={orgRef} className="relative w-[128px] shrink-0">
            <FieldLabel>Organizations</FieldLabel>
            <button
              type="button"
              onClick={() => setOrgOpen((value) => !value)}
              className={cn(
                selectClass,
                "flex items-center justify-between pr-3",
              )}
            >
              <span className="truncate text-[#6b7785]">{orgLabel}</span>
              <span
                aria-hidden="true"
                className="ml-2 text-[10px] text-[#7b8794]"
              >
                ▾
              </span>
            </button>
            {pickedOrgs.map((organization) => (
              <input
                key={organization}
                type="hidden"
                name="organization"
                value={organization}
              />
            ))}
            {orgOpen ? (
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
                        checked={selectedOrgs.has(organization)}
                        onChange={() => {
                          setPickedOrgs((current) =>
                            current.includes(organization)
                              ? current.filter((item) => item !== organization)
                              : [...current, organization],
                          );
                        }}
                        className="size-3.5 rounded border-[#c5ced8] accent-[#3d7ec4]"
                      />
                      {organization}
                    </label>
                  ))
                )}
              </div>
            ) : null}
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
              value={period}
              onChange={(event) => applyPreset(event.target.value)}
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

          {period === "Custom" ? (
            <>
              <label className="shrink-0">
                <input
                  name="dateFrom"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  placeholder="From"
                  className="h-[34px] w-[92px] rounded-md border border-[#d5dde5] bg-white px-2 text-[12px] text-[#2c3a4a]"
                />
              </label>
              <label className="shrink-0">
                <input
                  name="dateTo"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  placeholder="To"
                  className="h-[34px] w-[92px] rounded-md border border-[#d5dde5] bg-white px-2 text-[12px] text-[#2c3a4a]"
                />
              </label>
            </>
          ) : (
            <>
              <input type="hidden" name="dateFrom" value={dateFrom} />
              <input type="hidden" name="dateTo" value={dateTo} />
            </>
          )}

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
      ) : null}
    </form>
  );
}
