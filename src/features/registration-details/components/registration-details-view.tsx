"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";
import { asRoute } from "@/lib/utils/routes";

import {
  lockRegistration,
  readLockId,
  updateRegistrationProfile,
} from "../portal-actions";
import { mapCheckTabs, mapFurtherDetails } from "../map-check-tabs";
import type {
  CheckBadge,
  CheckTable,
  DetailField,
  RegistrationDetails,
} from "../types";

const statuses = ["ACTIVE", "INACTIVE", "REJECTED"] as const;
type ActionStatus = (typeof statuses)[number];

const DEFAULT_REASONS = [
  "Blacklist",
  "Sanction",
  "EID",
  "Fraud",
  "Other",
];

function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-[0.08em] text-[#8b95a1] uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 break-words text-[13px] font-medium",
          accent ? "text-[#3d7ec4]" : "text-[#2c3a4a]",
        )}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

function Badges({ badge }: { badge?: CheckBadge }) {
  if (!badge) {
    return null;
  }
  return (
    <span className="ml-2 inline-flex items-center gap-1">
      {badge.fail ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e25555] px-2 py-0.5 text-[11px] font-semibold text-white">
          <span aria-hidden="true">•</span>
          {badge.fail}
        </span>
      ) : null}
      {badge.pass ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#22a05a] px-2 py-0.5 text-[11px] font-semibold text-white">
          <span aria-hidden="true">•</span>
          {badge.pass}
        </span>
      ) : null}
      {badge.count && !badge.fail && !badge.pass ? (
        <span className="inline-flex items-center rounded-full bg-[#dce3ea] px-2 py-0.5 text-[11px] font-semibold text-[#2c3a4a]">
          {badge.count}
        </span>
      ) : null}
    </span>
  );
}

function StatusPill({ value }: { value: string }) {
  const text = value.trim() || "Not started";
  const upper = text.toUpperCase();
  const matchFound = /MATCH FOUND/.test(upper) && !/MATCH NOT FOUND/.test(upper);
  const matchClear = /MATCH NOT FOUND|NOT BLACKLISTED/.test(upper);
  const pending =
    !matchFound &&
    !matchClear &&
    /NOT REQUIRED|NOT STARTED|PENDING|N\/A|NA|----|REVIEW|EVALUATION|INACTIVE|UNDER/.test(
      upper,
    );
  const pass =
    matchClear ||
    (!pending &&
      !matchFound &&
      /PASS|SUCCESS|YES|TRUE|ACTIVE|VERIFIED/.test(upper));
  const fail =
    matchFound || (!pending && /FAIL|REJECT/.test(upper));
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase",
        pass && "bg-[#e8f8ee] text-[#1f9d55]",
        fail && "bg-[#fdecec] text-[#c0392b]",
        pending && "bg-[#fff4e0] text-[#c9842a]",
        !pass && !fail && !pending && "bg-[#eef4fb] text-[#3d7ec4]",
      )}
    >
      {text}
    </span>
  );
}

function MatchCards({ cards }: { cards: DetailField[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const upper = card.value.toUpperCase();
        const found =
          (/MATCH FOUND/.test(upper) && !/MATCH NOT FOUND/.test(upper)) ||
          /FAIL/.test(upper);
        const clear = /MATCH NOT FOUND|PASS|NOT BLACKLISTED/.test(upper);
        return (
          <div
            key={card.label}
            className={cn(
              "rounded-md border px-2 py-2",
              found && "border-[#f3c0c0] bg-[#fdecec]",
              clear && "border-[#bfe8cf] bg-[#e8f8ee]",
              !found && !clear && "border-[#dce3ea] bg-[#f7fbfe]",
            )}
          >
            <p className="mb-1 text-[10px] font-semibold tracking-wide text-[#6b7785] uppercase">
              {card.label}
            </p>
            <StatusPill value={card.value} />
          </div>
        );
      })}
    </div>
  );
}

function CheckGrid({ table }: { table: CheckTable }) {
  if (table.rows.length === 0) {
    return null;
  }
  const headers =
    table.headers.length > 0
      ? table.headers
      : table.rows[0]?.map((_, index) => `Col ${index + 1}`) ?? [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-xs">
        <thead>
          <tr className="border-b border-[#e8eef3] text-[10px] font-semibold tracking-wide text-[#6b7785] uppercase">
            {headers.map((header) => (
              <th key={header} className="px-2 py-1.5 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, index) => (
            <tr
              key={`${row.join("-")}-${index}`}
              className="border-b border-[#f3f6f9] last:border-0"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${cellIndex}-${cell}`}
                  className={cn(
                    "px-2 py-1.5 text-[#2c3a4a]",
                    /pass|success/i.test(cell) && "font-semibold text-[#22a05a]",
                    /fail/i.test(cell) && "font-semibold text-[#c0392b]",
                  )}
                >
                  {cell || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CheckPanel({ table }: { table: CheckTable }) {
  const fields =
    table.fields && table.fields.length > 0
      ? table.fields
      : table.headers.map((label, index) => ({
          label,
          value: table.rows[0]?.[index] ?? "—",
        }));
  const cards = table.cards ?? [];
  const manyRows = table.rows.length > 1;
  const listCheck = table.headers.some((header) =>
    /document|rules/i.test(header),
  );

  return (
    <div className="space-y-3 bg-white px-4 py-3">
      {fields.length > 0 ? (
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field, index) => (
            <Field
              key={`${field.label}-${index}`}
              label={field.label}
              value={field.value}
            />
          ))}
        </dl>
      ) : null}
      {cards.length > 0 ? <MatchCards cards={cards} /> : null}
      {manyRows || (listCheck && table.rows.length > 0) ? (
        <CheckGrid table={table} />
      ) : null}
      {fields.length === 0 &&
      cards.length === 0 &&
      table.rows.length === 0 ? (
        <p className="text-sm text-[#6b7785]">No records for this check.</p>
      ) : null}
    </div>
  );
}

function Accordion({
  id,
  title,
  badge,
  status,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  badge?: CheckBadge;
  status?: string;
  open: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-[#d7e4f0] last:border-b-0">
      <button
        type="button"
        id={id}
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center gap-2 bg-[#e8f2fb] px-3 py-2.5 text-left text-[12px] font-semibold tracking-[0.06em] text-[#1d4f7a] uppercase"
      >
        <span className="flex-1">
          {title}
          <Badges badge={badge} />
        </span>
        {status ? <StatusPill value={status} /> : null}
        <span className="text-sm text-[#3d7ec4]" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open ? children : null}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-full border border-[#d5dde5] bg-white text-[#3d7ec4] hover:bg-[#f3f8fd]"
    >
      {children}
    </button>
  );
}

function asActionStatus(value: string): ActionStatus {
  const upper = value.toUpperCase();
  if (upper === "INACTIVE" || upper === "REJECTED" || upper === "ACTIVE") {
    return upper;
  }
  return "ACTIVE";
}

export function RegistrationDetailsView({
  details,
}: {
  details: RegistrationDetails;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ActionStatus>(
    asActionStatus(details.status),
  );
  const reasonOptions = useMemo(() => {
    const merged = [...details.statusReasons, ...DEFAULT_REASONS];
    return [...new Set(merged.filter(Boolean))];
  }, [details.statusReasons]);
  const [reasons, setReasons] = useState<string[]>(
    details.selectedReasons.length > 0
      ? details.selectedReasons
      : details.status.toUpperCase() === "INACTIVE"
        ? []
        : [],
  );
  const [reasonPick, setReasonPick] = useState("");
  const [comment, setComment] = useState("");
  const [complianceLog, setComplianceLog] = useState(
    details.complianceLog === "—" ? "" : details.complianceLog,
  );
  const [owned, setOwned] = useState(details.owned);
  const [locked, setLocked] = useState(details.locked);
  const [lockedBy, setLockedBy] = useState(details.lockedBy);
  const [userResourceId, setUserResourceId] = useState(details.userResourceId);
  const [busy, setBusy] = useState<"lock" | "apply" | "unlock" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const inactive = status === "INACTIVE" || status === "REJECTED";
  const lockedByOther = locked && !owned;
  const canAct = Boolean(details.contactId) && owned && !busy;
  const backHref =
    details.source === "REPORT" ? routes.reportsOnboarding : routes.reg;
  const backLabel =
    details.source === "REPORT" ? "Onboarding report" : "Onboarding queue";

  const checkItems = mapCheckTabs(details);

  const checkIds = checkItems.map((item) => item.id);
  const otherIds = ["other-people", "further-details", "activity-log"];

  function toggleInGroup(id: string, groupIds: string[]) {
    setOpenIds((current) => {
      const wasOpen = current.has(id);
      const next = new Set(current);
      for (const groupId of groupIds) {
        next.delete(groupId);
      }
      if (!wasOpen) {
        next.add(id);
      }
      return next;
    });
  }

  function setGroup(ids: string[], open: boolean) {
    setOpenIds((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (open) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }

  async function ensureLock(): Promise<number | null> {
    if (owned) {
      return userResourceId;
    }
    if (!details.contactId) {
      throw new Error("This record is missing a contact id.");
    }
    const payload = await lockRegistration({
      contactId: details.contactId,
      lock: true,
      userResourceId,
    });
    const lockId = readLockId(payload) ?? userResourceId;
    setOwned(true);
    setLocked(true);
    setLockedBy("You");
    setUserResourceId(lockId);
    return lockId;
  }

  async function handleLock() {
    setBusy("lock");
    setError(null);
    setMessage(null);
    try {
      await ensureLock();
      setMessage("You own this record.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not lock this record.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleApply(unlock: boolean) {
    if (!details.contactId) {
      setError("This record is missing a contact id.");
      return;
    }
    if (details.accountId == null) {
      setError(
        "This record is missing an account id. Open it from the onboarding queue and try again.",
      );
      return;
    }
    if (inactive && reasons.length === 0) {
      setError("Pick a reason before setting INACTIVE or REJECTED.");
      return;
    }

    setBusy(unlock ? "unlock" : "apply");
    setError(null);
    setMessage(null);
    try {
      const lockId = await ensureLock();
      await updateRegistrationProfile({
        contactId: details.contactId,
        accountId: details.accountId,
        orgCode: details.orgCode,
        custType: details.custType,
        updatedStatus: status,
        preContactStatus: details.preContactStatus,
        preAccountStatus: details.preAccountStatus,
        comment,
        complianceLog,
        reason: reasons.join(", "),
        userResourceId: lockId,
      });
      if (unlock) {
        await lockRegistration({
          contactId: details.contactId,
          lock: false,
          userResourceId: lockId,
        });
        router.push(asRoute(backHref));
        return;
      }
      setMessage("Saved.");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not update this record.",
      );
    } finally {
      setBusy(null);
    }
  }

  function addReason(value: string) {
    if (!value || reasons.includes(value)) {
      setReasonPick("");
      return;
    }
    setReasons((current) => [...current, value]);
    setReasonPick("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div>
            <p className="text-xs text-navy-muted">
              <Link href={asRoute(backHref)} className="hover:underline">
                {backLabel}
              </Link>
            </p>
            <h1 className="text-xl font-semibold text-navy">
              Client #{details.clientNumber || details.contactId || "—"}
            </h1>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
              status === "ACTIVE" && "bg-[#22a05a] text-white",
              status === "INACTIVE" && "bg-[#c9842a] text-white",
              status === "REJECTED" && "bg-[#e25555] text-white",
            )}
          >
            <span aria-hidden="true">•</span>
            {status || "INACTIVE"}
          </span>
          <div className="flex items-center gap-1.5">
            <IconButton
              label={owned ? "You own this record" : "Lock this record to own it"}
              onClick={() => {
                if (!owned && !busy) {
                  void handleLock();
                }
              }}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </IconButton>
            <IconButton label="Refresh" onClick={() => router.refresh()}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12a9 9 0 1 1-2.6-6.3" />
                <path d="M21 4v6h-6" />
              </svg>
            </IconButton>
          </div>
        </div>
      </div>

      {details.error ? (
        <p className="rounded-lg bg-[#fdecec] px-4 py-2.5 text-sm text-navy">
          {details.error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-lg border border-[#dce3ea] bg-white p-4 shadow-[0_8px_20px_rgba(15,40,70,0.04)]">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
              <div className="space-y-3">
                <Field label="Name" value={details.name} accent />
                <Field
                  label="Contact Id"
                  value={details.contactId ? String(details.contactId) : "—"}
                />
                <Field label="Client type" value={details.clientType} />
                <Field label="Occupation" value={details.occupation} />
                <Field label="Email address" value={details.email} />
                <Field label="Legal Entity" value={details.legalEntity} />
              </div>
              <div className="space-y-3">
                <Field label="Date of birth" value={details.dateOfBirth} />
                <Field label="Phone" value={details.phone} />
                <Field label="Mobile" value={details.mobile} />
                <Field label="Currency Pair" value={details.currencyPair} />
                <Field
                  label="Estimated transaction value"
                  value={details.estimatedTxnValue}
                />
                <Field
                  label="Purpose of transaction"
                  value={details.purposeOfTxn}
                />
                <Field label="AI ETV Band" value={details.aiEtvBand} />
              </div>
              <div className="space-y-3">
                <Field
                  label="Country of residence"
                  value={details.countryOfResidence}
                />
                <Field label="Nationality" value={details.nationality} />
                <Field label="Client number" value={details.clientNumber} />
                <Field label="Organization" value={details.organization} />
                <Field label="Source of funds" value={details.sourceOfFunds} />
                <Field
                  label="Is primary contact"
                  value={details.primaryContact}
                />
              </div>
            </dl>
            <div className="mt-4 rounded-md border border-[#f0d48a] bg-[#fff6d8] px-3 py-2">
              <p className="text-[10px] font-semibold tracking-[0.08em] text-[#8a6d1b] uppercase">
                Compliance log
              </p>
              <p className="mt-1 text-sm text-[#2c3a4a]">
                {details.complianceLog || "....."}
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-[#dce3ea] bg-white shadow-[0_8px_20px_rgba(15,40,70,0.04)]">
            <div className="flex items-center justify-between border-b border-[#e8eef3] px-3 py-2">
              <h2 className="text-sm font-semibold text-[#2c3a4a]">Checks</h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  title="Expand all"
                  onClick={() =>
                    setGroup(
                      checkItems.map((item) => item.id),
                      true,
                    )
                  }
                  className="inline-flex size-6 items-center justify-center rounded border border-[#d5dde5] text-sm text-[#6b7785]"
                >
                  +
                </button>
                <button
                  type="button"
                  title="Collapse all"
                  onClick={() =>
                    setGroup(
                      checkItems.map((item) => item.id),
                      false,
                    )
                  }
                  className="inline-flex size-6 items-center justify-center rounded border border-[#d5dde5] text-sm text-[#6b7785]"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b border-[#e8eef3] bg-[#f7fbfe] px-3 py-3 sm:grid-cols-4 lg:grid-cols-7">
              {checkItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInGroup(item.id, checkIds)}
                    className={cn(
                      "rounded-md border bg-white px-2 py-2 text-left",
                      openIds.has(item.id)
                        ? "border-[#3d7ec4]"
                        : "border-[#dce3ea]",
                    )}
                  >
                    <p className="mb-1 truncate text-[10px] font-semibold tracking-wide text-[#6b7785] uppercase">
                      {item.title}
                    </p>
                    <StatusPill value={item.status} />
                  </button>
              ))}
            </div>
            {checkItems.map((item) => (
              <Accordion
                key={item.id}
                id={item.id}
                title={item.title}
                badge={item.badge}
                status={item.status}
                open={openIds.has(item.id)}
                onToggle={() => toggleInGroup(item.id, checkIds)}
              >
                <CheckPanel table={item.table} />
              </Accordion>
            ))}
          </section>

          <section className="overflow-hidden rounded-lg border border-[#dce3ea] bg-white shadow-[0_8px_20px_rgba(15,40,70,0.04)]">
            <div className="flex items-center justify-between border-b border-[#e8eef3] px-3 py-2">
              <h2 className="text-sm font-semibold text-[#2c3a4a]">
                Other information
              </h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  title="Expand all"
                  onClick={() =>
                    setGroup(
                      ["other-people", "further-details", "activity-log"],
                      true,
                    )
                  }
                  className="inline-flex size-6 items-center justify-center rounded border border-[#d5dde5] text-sm text-[#6b7785]"
                >
                  +
                </button>
                <button
                  type="button"
                  title="Collapse all"
                  onClick={() =>
                    setGroup(
                      ["other-people", "further-details", "activity-log"],
                      false,
                    )
                  }
                  className="inline-flex size-6 items-center justify-center rounded border border-[#d5dde5] text-sm text-[#6b7785]"
                >
                  ×
                </button>
              </div>
            </div>
            <Accordion
              id="other-people"
              title="Other people on this account"
              badge={details.badges.otherPeople}
              open={openIds.has("other-people")}
              onToggle={() => toggleInGroup("other-people", otherIds)}
            >
              {details.otherPeople.length === 0 ? (
                <p className="px-3 pb-3 text-sm text-[#6b7785]">
                  No other contacts found.
                </p>
              ) : (
                <ul className="space-y-1 px-3 pb-3 text-sm">
                  {details.otherPeople.map((person) => (
                    <li
                      key={`${person.id}-${person.name}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase",
                          person.status.toUpperCase() === "ACTIVE"
                            ? "bg-[#e8f8ee] text-[#1f9d55]"
                            : person.status.toUpperCase() === "REJECTED"
                              ? "bg-[#fdecec] text-[#c0392b]"
                              : "bg-[#fff4e0] text-[#c9842a]",
                        )}
                      >
                        {person.status}
                      </span>
                      {person.id ? (
                        <Link
                          href={asRoute(
                            `/reg/${person.id}?type=${encodeURIComponent(person.custType || details.custType)}`,
                          )}
                          className="text-[#3d7ec4] hover:underline"
                        >
                          {person.name}
                        </Link>
                      ) : (
                        <span>{person.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Accordion>
            <Accordion
              id="further-details"
              title="Further client details"
              open={openIds.has("further-details")}
              onToggle={() => toggleInGroup("further-details", otherIds)}
            >
              <dl className="grid gap-3 px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
                {mapFurtherDetails(details).map((field, index) => (
                  <Field
                    key={`${field.label}-${index}`}
                    label={field.label}
                    value={field.value}
                  />
                ))}
              </dl>
            </Accordion>
            <Accordion
              id="activity-log"
              title="Activity log"
              open={openIds.has("activity-log")}
              onToggle={() => toggleInGroup("activity-log", otherIds)}
            >
              {details.activityLog.length === 0 ? (
                <p className="px-3 pb-3 text-sm text-[#6b7785]">
                  No activity recorded.
                </p>
              ) : (
                <div className="px-3 pb-3">
                  <CheckGrid
                    table={{
                      headers: [
                        "Activity date/time",
                        "Trade Contract Number",
                        "User",
                        "Activity",
                        "Activity type",
                        "Comment",
                      ],
                      rows: details.activityLog.map((row) => [
                        row.date,
                        row.contract,
                        row.user,
                        row.activity,
                        row.activityType,
                        row.comment,
                      ]),
                    }}
                  />
                </div>
              )}
            </Accordion>
          </section>
        </div>

        <aside className="space-y-3">
          <section className="overflow-hidden rounded-lg border border-[#dce3ea] bg-white shadow-[0_8px_20px_rgba(15,40,70,0.04)]">
            <h2 className="bg-[#3d7ec4] px-4 py-2.5 text-sm font-semibold text-white">
              Actions
            </h2>
            <div className="p-4">
              <p className="mb-2 text-[11px] font-medium text-[#8b95a1]">
                Tools
              </p>
              <div className="space-y-1.5">
                {[
                  ["View original", "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
                  ["View social data", "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 22v-2a4 4 0 0 1 4-4h0"],
                  ["Forget me", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
                  ["View FraudRing", "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z"],
                ].map(([label, path]) => (
                  <button
                    key={label}
                    type="button"
                    disabled
                    className="flex w-full items-center gap-2 rounded-md border border-[#d5dde5] bg-white px-3 py-1.5 text-left text-sm text-[#2c3a4a] disabled:opacity-60"
                  >
                    <svg
                      className="size-4 shrink-0 text-[#3d7ec4]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d={path} />
                    </svg>
                    {label}
                  </button>
                ))}
              </div>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-[11px] font-medium text-[#8b95a1]">
                  Add to watchlists
                </span>
                <select
                  disabled
                  className="h-[34px] w-full rounded-md border border-[#d5dde5] bg-white px-3 text-sm text-[#6b7785]"
                >
                  <option>Please select</option>
                  {details.watchlists.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <p className="mt-4 mb-1.5 text-[11px] font-medium text-[#8b95a1]">
                Update status
              </p>
              <div className="flex overflow-hidden rounded-md border border-[#d5dde5]">
                {statuses.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStatus(item)}
                    disabled={Boolean(busy) || lockedByOther}
                    className={cn(
                      "flex-1 px-2 py-1.5 text-[11px] font-semibold",
                      status === item &&
                        item === "ACTIVE" &&
                        "bg-[#22a05a] text-white",
                      status === item &&
                        item === "INACTIVE" &&
                        "bg-[#c9842a] text-white",
                      status === item &&
                        item === "REJECTED" &&
                        "bg-[#e25555] text-white",
                      status !== item && "bg-white text-[#6b7785]",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <span className="mb-1.5 block text-[11px] font-medium text-[#8b95a1]">
                  Select a reason
                </span>
                {reasons.length > 0 ? (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {reasons.map((reason) => (
                      <span
                        key={reason}
                        className="inline-flex items-center gap-1 rounded-full bg-[#eef4fb] px-2 py-0.5 text-xs text-[#2c3a4a]"
                      >
                        {reason}
                        <button
                          type="button"
                          aria-label={`Remove ${reason}`}
                          disabled={Boolean(busy) || lockedByOther}
                          onClick={() =>
                            setReasons((current) =>
                              current.filter((item) => item !== reason),
                            )
                          }
                          className="text-[#8b95a1] hover:text-[#c0392b]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
                <select
                  value={reasonPick}
                  onChange={(event) => addReason(event.target.value)}
                  disabled={Boolean(busy) || lockedByOther}
                  className="h-[34px] w-full rounded-md border border-[#d5dde5] bg-white px-3 text-sm text-[#2c3a4a]"
                >
                  <option value="">Please select</option>
                  {reasonOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <label className="mt-3 block">
                <span className="mb-1.5 block text-[11px] font-medium text-[#8b95a1]">
                  Add comments
                </span>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  disabled={Boolean(busy) || lockedByOther}
                  className="w-full rounded-md border border-[#d5dde5] px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-3 block">
                <span className="mb-1.5 block text-[11px] font-medium text-[#8b95a1]">
                  Add compliance log
                </span>
                <textarea
                  rows={3}
                  value={complianceLog}
                  onChange={(event) => setComplianceLog(event.target.value)}
                  disabled={Boolean(busy) || lockedByOther}
                  className="w-full rounded-md border border-[#d5dde5] px-3 py-2 text-sm"
                />
              </label>

              {error ? (
                <p className="mt-3 rounded-md bg-[#fdecec] px-3 py-2 text-xs text-[#c0392b]">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="mt-3 rounded-md bg-[#e8f8ee] px-3 py-2 text-xs text-[#1f9d55]">
                  {message}
                </p>
              ) : null}

              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  disabled={!canAct}
                  onClick={() => void handleApply(false)}
                  className="w-full rounded-md bg-[#3d7ec4] px-3 py-1.5 text-sm font-medium text-white disabled:bg-[#c5d0da] disabled:text-white"
                >
                  {busy === "apply" ? "Saving…" : "Apply"}
                </button>
                <button
                  type="button"
                  disabled={!canAct}
                  onClick={() => void handleApply(true)}
                  className="w-full rounded-md bg-[#3d7ec4] px-3 py-1.5 text-sm font-medium text-white disabled:bg-[#c5d0da] disabled:text-white"
                >
                  {busy === "unlock" ? "Saving…" : "Apply & UNLOCK"}
                </button>
              </div>
              {lockedByOther ? (
                <p className="mt-2 text-xs text-[#c0392b]">
                  {lockedBy || "Someone else"} own(s) this record.
                </p>
              ) : owned ? (
                <p className="mt-2 text-xs text-[#1f9d55]">You own this record.</p>
              ) : (
                <button
                  type="button"
                  disabled={!details.contactId || Boolean(busy)}
                  onClick={() => void handleLock()}
                  className="mt-2 text-xs text-[#3d7ec4] hover:underline disabled:opacity-50"
                >
                  {busy === "lock" ? "Locking…" : "Lock this record to own it"}
                </button>
              )}
            </div>
          </section>

          {details.lastUpdatedBy ? (
            <p className="px-1 text-xs text-[#6b7785]">
              Last updated by{" "}
              <strong className="text-[#2c3a4a]">
                {details.lastUpdatedBy}
              </strong>{" "}
              on {details.lastUpdatedOn}
              <br />
              <button
                type="button"
                onClick={() =>
                  setOpenIds((current) => {
                    const next = new Set(current);
                    for (const id of otherIds) {
                      next.delete(id);
                    }
                    next.add("activity-log");
                    return next;
                  })
                }
                className="text-[#3d7ec4] hover:underline"
              >
                See activity log
              </button>{" "}
              for more details
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
