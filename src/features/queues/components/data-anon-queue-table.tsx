import { dataAnonColumns } from "@/constants/screens";
import { cn } from "@/lib/utils/cn";

import type { QueueResult, QueueRow } from "../types";

const dateColumns = new Set(["Request date", "Approved date"]);
const actionColumns = new Set(["Confirm", "Cancel"]);

const columnWidth: Record<(typeof dataAnonColumns)[number], string> = {
  "Client number": "w-[10%]",
  "Client name": "w-[14%]",
  Type: "w-[7%]",
  "Request date": "w-[10%]",
  "Request by": "w-[11%]",
  "Approved date": "w-[10%]",
  "Approved by": "w-[11%]",
  Status: "w-[7%]",
  Confirm: "w-[10%]",
  Cancel: "w-[10%]",
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

function canActOn(row: QueueRow): boolean {
  const status = (row.status ?? "").trim().toUpperCase();
  return (
    status.length > 0 &&
    status !== "INACTIVE" &&
    status !== "CANCELLED" &&
    status !== "CANCELED" &&
    status !== "COMPLETED" &&
    status !== "ANONYMISED" &&
    status !== "ANONYMIZED"
  );
}

function ActionButton({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <button
      type="button"
      disabled={!enabled}
      title={enabled ? label : "Unavailable for this status"}
      className={cn(
        "inline-flex h-7 items-center justify-center rounded border px-2.5 text-[11px] font-medium whitespace-nowrap",
        enabled
          ? "border-[#3d7ec4] bg-white text-[#3d7ec4] hover:bg-[#f3f8fd]"
          : "cursor-not-allowed border-[#d5dde5] bg-[#eef1f4] text-[#b0b7c0]",
      )}
    >
      {label}
    </button>
  );
}

type DataAnonQueueTableProps = {
  result: QueueResult;
  emptyTitle: string;
  emptyDescription: string;
};

export function DataAnonQueueTable({
  result,
  emptyTitle,
  emptyDescription,
}: DataAnonQueueTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-[0_10px_28px_rgba(15,40,70,0.06)]">
      <table className="w-full table-fixed text-left text-xs">
        <colgroup>
          {dataAnonColumns.map((column) => (
            <col key={column} className={columnWidth[column]} />
          ))}
        </colgroup>
        <thead className="border-b border-slate-100 bg-[#f7fbfe] text-[10px] font-semibold tracking-wide text-[#6b9ad4] uppercase">
          <tr>
            {dataAnonColumns.map((column) => (
              <th
                key={column}
                className={cn(
                  "px-1.5 py-2 align-bottom leading-tight font-semibold",
                  actionColumns.has(column) && "text-center",
                  column === "Cancel" && "pr-4",
                )}
              >
                {column === "Request date" ? (
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
                colSpan={dataAnonColumns.length}
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
              const enabled = canActOn(row);
              return (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  {dataAnonColumns.map((column, index) => {
                    if (column === "Confirm") {
                      return (
                        <td
                          key={column}
                          className="px-1.5 py-2 text-center whitespace-nowrap"
                        >
                          <ActionButton label="Confirm" enabled={enabled} />
                        </td>
                      );
                    }
                    if (column === "Cancel") {
                      return (
                        <td
                          key={column}
                          className="px-1.5 py-2 pr-4 text-center whitespace-nowrap"
                        >
                          <ActionButton label="Cancel" enabled={enabled} />
                        </td>
                      );
                    }

                    const value = row.cells[index] ?? "—";
                    return (
                      <td
                        key={column}
                        className={cn(
                          "px-1.5 py-2 align-middle break-words text-navy",
                          column === "Type" && "font-medium uppercase",
                          column === "Status" && "text-[#3d7ec4]",
                          column === "Client name" && "break-all",
                        )}
                      >
                        {dateColumns.has(column) ? (
                          <DateCell value={value} />
                        ) : (
                          value
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
