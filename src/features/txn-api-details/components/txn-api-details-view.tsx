import Link from "next/link";

import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";
import { asRoute } from "@/lib/utils/routes";

import type { TxnApiDetails } from "../types";

function Field({ label, value }: { label: string; value: string }) {
  const multiline = value.includes("\n");
  return (
    <div>
      <dt className="text-[11px] font-medium text-[#8b95a1]">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 break-words text-sm text-[#2c3a4a]",
          multiline && "whitespace-pre-wrap font-mono text-[12px]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function TxnApiDetailsView({ details }: { details: TxnApiDetails }) {
  const backHref =
    details.source === "REPORT" ? routes.reportsTransactions : routes.txnApi;
  const backLabel =
    details.source === "REPORT" ? "Transaction report" : "Transaction queue";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-navy-muted">
          <Link href={asRoute(backHref)} className="hover:underline">
            {backLabel}
          </Link>
        </p>
        <h1 className="text-xl font-semibold text-navy">
          Payment #{details.title}
        </h1>
      </div>

      {details.error ? (
        <p className="rounded-lg bg-[#fdecec] px-4 py-2.5 text-sm text-navy">
          {details.error}
        </p>
      ) : null}

      {details.status ? (
        <p className="inline-flex rounded-full bg-[#eef4fb] px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#3d7ec4] uppercase">
          {details.status}
        </p>
      ) : null}

      {details.sections.map((section) => (
        <section
          key={section.title}
          className="rounded-lg border border-[#dce3ea] bg-white p-4"
        >
          <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-[#2c3a4a] uppercase">
            {section.title}
          </h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            {section.fields.map((field) => (
              <Field
                key={`${section.title}-${field.label}`}
                label={field.label}
                value={field.value}
              />
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
