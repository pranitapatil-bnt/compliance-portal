import {
  paymentsCheckColumns,
  paymentsCheckHints,
  paymentsQueueColumns,
} from "@/constants/screens";
import { cn } from "@/lib/utils/cn";

import { CheckStatusIcon } from "./check-status-icon";
import type { QueueResult } from "../types";

const checkColumnSet = new Set<string>(paymentsCheckColumns);

const columnWidth: Record<(typeof paymentsQueueColumns)[number], string> = {
  "Transaction ID": "w-[10%]",
  Date: "w-[8%]",
  "Client name": "w-[11%]",
  Type: "w-[8%]",
  Organization: "w-[9%]",
  Currency: "w-[6%]",
  Amount: "w-[7%]",
  "Sender / Beneficiary": "w-[10%]",
  Country: "w-[8%]",
  "Overall status": "w-[8%]",
  Direction: "w-[7%]",
  W: "w-[2.6%]",
  F: "w-[2.6%]",
  S: "w-[2.6%]",
  B: "w-[2.6%]",
  C: "w-[2.6%]",
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

type PaymentsQueueTableProps = {
  result: QueueResult;
  emptyTitle: string;
  emptyDescription: string;
};

export function PaymentsQueueTable({
  result,
  emptyTitle,
  emptyDescription,
}: PaymentsQueueTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(15,40,70,0.06)]">
      <table className="w-full table-fixed text-left text-xs">
        <colgroup>
          {paymentsQueueColumns.map((column) => (
            <col key={column} className={columnWidth[column]} />
          ))}
        </colgroup>
        <thead className="border-b border-slate-100 bg-[#f7fbfe] text-[10px] font-semibold tracking-wide text-[#6b9ad4] uppercase">
          <tr>
            {paymentsQueueColumns.map((column) => (
              <th
                key={column}
                title={
                  column in paymentsCheckHints
                    ? paymentsCheckHints[
                        column as (typeof paymentsCheckColumns)[number]
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
                colSpan={paymentsQueueColumns.length}
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
                  className={cn(
                    "border-b border-slate-100 last:border-b-0",
                    row.owned &&
                      "border-l-[3px] border-l-[#3cb371] bg-[#eef7f2]",
                    faded && "bg-[#f4f6f8] text-[#9aa3b2]",
                  )}
                >
                  {paymentsQueueColumns.map((column, index) => {
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
                        )}
                      >
                        {cell}
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
