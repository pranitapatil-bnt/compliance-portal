"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  onboardingCheckColumns,
  onboardingCheckHints,
  onboardingColumns,
} from "@/constants/screens";
import { cn } from "@/lib/utils/cn";
import { asRoute } from "@/lib/utils/routes";

import { CheckStatusIcon } from "./check-status-icon";
import type { QueueResult } from "../types";

const checkColumnSet = new Set<string>(onboardingCheckColumns);

const columnWidth: Record<(typeof onboardingColumns)[number], string> = {
  Date: "w-[11%]",
  "Client name": "w-[14%]",
  Type: "w-[8%]",
  "Country of Residence": "w-[15%]",
  Organization: "w-[12%]",
  "N/U": "w-[4%]",
  "Onboarding Date": "w-[9%]",
  "Transaction value": "w-[11%]",
  E: "w-[3.2%]",
  F: "w-[3.2%]",
  S: "w-[3.2%]",
  B: "w-[3.2%]",
  C: "w-[3.2%]",
};

function DateCell({ value }: { value: string }) {
  const [date, time] = value.split(/\s+/);
  if (!time) {
    return value;
  }

  return (
    <span className="block leading-tight">
      <span className="block">{date}</span>
      <span className="block text-[11px] opacity-70">{time}</span>
    </span>
  );
}

type OnboardingQueueTableProps = {
  result: QueueResult;
  emptyTitle: string;
  emptyDescription: string;
};

export function OnboardingQueueTable({
  result,
  emptyTitle,
  emptyDescription,
}: OnboardingQueueTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(15,40,70,0.06)]">
      <table className="w-full table-fixed text-left text-xs">
        <colgroup>
          {onboardingColumns.map((column) => (
            <col key={column} className={columnWidth[column]} />
          ))}
        </colgroup>
        <thead className="border-b border-slate-100 bg-[#f7fbfe] text-[10px] font-semibold tracking-wide text-[#6b9ad4] uppercase">
          <tr>
            {onboardingColumns.map((column) => (
              <th
                key={column}
                title={
                  column in onboardingCheckHints
                    ? onboardingCheckHints[
                        column as (typeof onboardingCheckColumns)[number]
                      ]
                    : column
                }
                className={cn(
                  "px-1.5 py-2 align-bottom leading-tight font-semibold",
                  checkColumnSet.has(column) && "px-0.5 text-center",
                )}
              >
                {column === "Date" ? (
                  <span className="inline-flex items-center gap-0.5">
                    {column}
                    <span aria-hidden="true">▾</span>
                  </span>
                ) : (
                  column
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.length === 0 ? (
            <tr>
              <td
                colSpan={onboardingColumns.length}
                className="px-4 py-12 text-center"
              >
                <p className="text-sm font-medium text-navy">{emptyTitle}</p>
                <p className="mt-1 text-sm text-navy-muted">
                  {emptyDescription}
                </p>
              </td>
            </tr>
          ) : (
            result.rows.map((row) => {
              const faded = row.locked && !row.owned;
              return (
                <tr
                  key={row.id}
                  title={
                    row.locked
                      ? row.lockedBy
                        ? `${row.lockedBy} own(s) this record`
                        : "This record is locked"
                      : undefined
                  }
                  tabIndex={row.href ? 0 : undefined}
                  onClick={() => {
                    if (row.href) {
                      router.push(asRoute(row.href));
                    }
                  }}
                  onKeyDown={(event) => {
                    if (!row.href) {
                      return;
                    }
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(asRoute(row.href));
                    }
                  }}
                  className={cn(
                    "border-b border-slate-100 last:border-b-0",
                    row.href && "cursor-pointer hover:bg-[#f3f8fd]",
                    row.owned && "bg-[#eef7f2]",
                    faded && "bg-[#f4f6f8] text-[#9aa3b2]",
                  )}
                >
                  {onboardingColumns.map((column, index) => {
                    const value = row.cells[index] ?? "—";
                    const isCheck = checkColumnSet.has(column);
                    const cell = isCheck ? (
                      <CheckStatusIcon value={value} />
                    ) : column === "Date" ? (
                      <DateCell value={value} />
                    ) : (
                      value
                    );
                    return (
                      <td
                        key={column}
                        className={cn(
                          "px-1.5 py-2 align-middle break-words",
                          faded ? "text-[#9aa3b2]" : "text-navy",
                          isCheck && "px-0.5 text-center",
                          column === "Type" &&
                            !faded &&
                            "font-medium uppercase",
                          column === "Client name" &&
                            !faded &&
                            "text-[#3d7ec4]",
                          column === "N/U" && "text-center",
                        )}
                      >
                        {row.href ? (
                          <Link href={asRoute(row.href)} className="block">
                            {cell}
                          </Link>
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
