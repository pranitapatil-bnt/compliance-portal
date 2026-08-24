"use client";

import Link from "next/link";
import { useState } from "react";

import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";

import type { CheckBadge, RegistrationDetails } from "../types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-[#8b95a1]">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-[#2c3a4a]">{value}</dd>
    </div>
  );
}

function Badges({ badge }: { badge: CheckBadge }) {
  return (
    <span className="ml-2 inline-flex items-center gap-1">
      {badge.fail ? (
        <span className="rounded-full bg-[#e25555] px-1.5 text-[11px] font-semibold text-white">
          {badge.fail}
        </span>
      ) : null}
      {badge.pass ? (
        <span className="rounded-full bg-[#22a05a] px-1.5 text-[11px] font-semibold text-white">
          {badge.pass}
        </span>
      ) : null}
    </span>
  );
}

function Accordion({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: CheckBadge;
  children?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#e8eef3] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] font-semibold tracking-wide text-[#2c3a4a] uppercase"
      >
        <span>
          {title}
          {badge ? <Badges badge={badge} /> : null}
        </span>
        <span className="text-[#8b95a1]">{open ? "–" : "+"}</span>
      </button>
      {open ? (
        <div className="px-3 pb-3 text-sm text-[#6b7785]">
          {children ?? "No extra detail on this check."}
        </div>
      ) : null}
    </div>
  );
}

export function RegistrationDetailsView({
  details,
}: {
  details: RegistrationDetails;
}) {
  const [status, setStatus] = useState(details.status.toUpperCase());
  const inactive = status === "INACTIVE" || status === "REJECTED";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs text-navy-muted">
            <Link href={routes.reg} className="hover:underline">
              Onboarding queue
            </Link>
          </p>
          <h1 className="text-xl font-semibold text-navy">
            Client #{details.clientNumber}
          </h1>
        </div>
      </div>

      {details.error ? (
        <p className="rounded-lg bg-[#fdecec] px-4 py-2.5 text-sm text-navy">
          {details.error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-lg border border-[#dce3ea] bg-white p-4">
            <p
              className={cn(
                "mb-4 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
                inactive
                  ? "bg-[#fdecec] text-[#c0392b]"
                  : "bg-[#e8f8ee] text-[#1f9d55]",
              )}
            >
              {status || "INACTIVE"}
            </p>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-3">
                <Field label="Name" value={details.name} />
                <Field label="Client type" value={details.clientType} />
                <Field label="Occupation" value={details.occupation} />
                <Field label="Email address" value={details.email} />
                <Field label="Legal Entity" value={details.legalEntity} />
              </div>
              <div className="space-y-3">
                <Field label="Date of birth" value={details.dateOfBirth} />
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
                <Field label="Organization" value={details.organization} />
                <Field label="Source of funds" value={details.sourceOfFunds} />
                <Field
                  label="Is primary contact"
                  value={details.primaryContact}
                />
              </div>
            </dl>
            <div className="mt-4 rounded-md bg-[#fff6d8] px-3 py-2">
              <p className="text-[11px] font-semibold tracking-wide text-[#8a6d1b] uppercase">
                Compliance log
              </p>
              <p className="mt-1 text-sm text-[#2c3a4a]">
                {details.complianceLog || "—"}
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-[#dce3ea] bg-white">
            <div className="flex items-center justify-between border-b border-[#e8eef3] px-3 py-2">
              <h2 className="text-sm font-semibold text-[#2c3a4a]">Checks</h2>
              <span className="text-xs text-[#8b95a1]">+ ×</span>
            </div>
            <Accordion title="Blacklist" badge={details.badges.blacklist} />
            <Accordion title="EID" badge={details.badges.eid} />
            <Accordion title="Sanctions" badge={details.badges.sanction} />
            <Accordion title="Custom checks" badge={details.badges.custom} />
            <Accordion title="Onfido" badge={details.badges.onfido} />
            <Accordion title="Attached documents" />
            <Accordion
              title="FraudPredict"
              badge={details.badges.fraudPredict}
            />
          </section>

          <section className="rounded-lg border border-[#dce3ea] bg-white">
            <div className="flex items-center justify-between border-b border-[#e8eef3] px-3 py-2">
              <h2 className="text-sm font-semibold text-[#2c3a4a]">
                Other information
              </h2>
              <span className="text-xs text-[#8b95a1]">+ ×</span>
            </div>
            <Accordion title="Other people on this account" />
            <Accordion title="Further client details" />
            <Accordion title="Activity log" />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-[#dce3ea] bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-[#2c3a4a]">
              Actions
            </h2>
            <p className="mb-2 text-[11px] font-medium text-[#8b95a1]">Tools</p>
            <div className="space-y-2">
              {[
                "View original",
                "View social data",
                "Forget me",
                "View FraudRing",
              ].map((label) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  className="w-full rounded-md border border-[#d5dde5] bg-white px-3 py-1.5 text-left text-sm text-[#2c3a4a] disabled:opacity-60"
                >
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
              </select>
            </label>

            <p className="mt-4 mb-1.5 text-[11px] font-medium text-[#8b95a1]">
              Update status
            </p>
            <div className="flex overflow-hidden rounded-md border border-[#d5dde5]">
              {(["ACTIVE", "INACTIVE", "REJECTED"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={cn(
                    "flex-1 px-2 py-1.5 text-[11px] font-semibold",
                    status === item &&
                      item === "ACTIVE" &&
                      "bg-[#22a05a] text-white",
                    status === item &&
                      item !== "ACTIVE" &&
                      "bg-[#e25555] text-white",
                    status !== item && "bg-white text-[#6b7785]",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-[11px] font-medium text-[#8b95a1]">
                Select a reason
              </span>
              <select className="h-[34px] w-full rounded-md border border-[#d5dde5] bg-white px-3 text-sm text-[#2c3a4a]">
                <option>Blacklist</option>
              </select>
            </label>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-[11px] font-medium text-[#8b95a1]">
                Add comments
              </span>
              <textarea
                rows={3}
                className="w-full rounded-md border border-[#d5dde5] px-3 py-2 text-sm"
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-[11px] font-medium text-[#8b95a1]">
                Add compliance log
              </span>
              <textarea
                rows={3}
                className="w-full rounded-md border border-[#d5dde5] px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled
                className="rounded-md bg-[#3d7ec4] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Apply
              </button>
              <button
                type="button"
                disabled
                className="rounded-md bg-[#3d7ec4] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Apply & UNLOCK
              </button>
            </div>
            <p className="mt-2 text-xs text-[#3d7ec4]">
              Lock this record to own it.
            </p>
          </section>

          {details.lastUpdatedBy ? (
            <p className="text-xs text-[#6b7785]">
              Last updated by{" "}
              <strong className="text-[#2c3a4a]">
                {details.lastUpdatedBy}
              </strong>{" "}
              on {details.lastUpdatedOn}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
