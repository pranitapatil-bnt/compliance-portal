import type {
  CheckBadge,
  CheckTable,
  DetailField,
  RegistrationDetails,
} from "./types";

export type CheckTab = {
  id: string;
  title: string;
  badge?: CheckBadge;
  status: string;
  table: CheckTable;
};

function val(...values: Array<string | undefined>): string {
  for (const value of values) {
    const text = value?.trim();
    if (text && text !== "—") {
      return text;
    }
  }
  return "—";
}

function extraVal(details: RegistrationDetails, labels: string[]): string {
  const wanted = labels.map((label) => label.toLowerCase());
  for (const field of details.furtherDetails) {
    if (wanted.includes(field.label.toLowerCase())) {
      return val(field.value);
    }
  }
  return "—";
}

function fromCheck(table: CheckTable | undefined, labels: string[]): string {
  if (!table) {
    return "—";
  }
  for (const wanted of labels) {
    const field = table.fields?.find(
      (item) => item.label.toLowerCase() === wanted.toLowerCase(),
    );
    if (field && field.value && field.value !== "—") {
      return field.value;
    }
  }
  for (const wanted of labels) {
    const index = table.headers.findIndex(
      (header) => header.toLowerCase() === wanted.toLowerCase(),
    );
    if (index >= 0) {
      return val(table.rows[0]?.[index]);
    }
  }
  return "—";
}

function fields(
  entries: Array<[string, string | undefined]>,
): DetailField[] {
  return entries.map(([label, value]) => ({ label, value: val(value) }));
}

function ipExtras(custom: CheckTable | undefined): {
  city: string;
  country: string;
  geo: string;
} {
  const empty = { city: "—", country: "—", geo: "—" };
  if (!custom) {
    return empty;
  }
  const row =
    custom.rows.find((item) => /ip distance/i.test(item[1] ?? "")) ??
    custom.rows[0];
  const raw = row?.[2]?.trim() ?? "";
  if (!raw || raw === "—") {
    return empty;
  }
  const tokens = raw.split(/\s+/).filter(Boolean);
  const skip = /^(true|false|pass|fail|not|required|match|found)$/i;
  const extras = tokens.filter((token) => !skip.test(token));
  return {
    city: extras[0] ?? "—",
    country: extras[1] ?? "—",
    geo: extras.slice(2).join(" ") || "—",
  };
}

function tab(
  id: string,
  title: string,
  badge: CheckBadge | undefined,
  status: string,
  source: CheckTable | undefined,
  mapped: DetailField[],
  cards?: DetailField[],
  extraRows?: string[][],
): CheckTab {
  const rows = extraRows ?? source?.rows ?? [];
  const listCheck = (source?.headers ?? []).some((header) =>
    /document|rules/i.test(header),
  );
  return {
    id,
    title,
    badge,
    status: val(status, source?.status, "Not started"),
    table: {
      ...source,
      status: val(status, source?.status),
      fields: mapped,
      cards,
      headers: source?.headers ?? mapped.map((field) => field.label),
      rows: listCheck || rows.length > 1 ? rows : [],
    },
  };
}

export function mapCheckTabs(details: RegistrationDetails): CheckTab[] {
  const blacklist = details.checks.blacklist;
  const eid = details.checks.eid;
  const sanction = details.checks.sanction;
  const fraud = details.checks.fraudPredict;
  const custom = details.checks.custom;
  const onfido = details.checks.onfido;
  const documents = details.checks.documents;
  const ip = ipExtras(custom);

  const nameMatch = fromCheck(blacklist, ["Name match"]);
  const phoneMatch = fromCheck(blacklist, ["Phone match"]);
  const emailMatch = fromCheck(blacklist, ["Email match"]);
  const domainMatch = fromCheck(blacklist, ["Domain match"]);
  const ipMatch = fromCheck(blacklist, ["IP match"]);
  const overall = fromCheck(blacklist, ["Overall status", "Status"]);
  const matchBlob = `${nameMatch} ${phoneMatch} ${emailMatch} ${domainMatch} ${ipMatch} ${overall}`;
  const failBlob = matchBlob.replace(/match not found/gi, "");
  const blacklistStatus = /match found|\bfail\b/i.test(failBlob)
    ? "Match found"
    : /not required/i.test(overall)
      ? "Not required"
      : /match not found|pass|not blacklisted/i.test(matchBlob)
        ? "Not blacklisted"
        : val(overall, blacklist.status, "Not started");

  const matchCards = fields([
    ["Name match", nameMatch],
    ["Phone match", phoneMatch],
    ["Email match", emailMatch],
    ["Domain match", domainMatch],
    ["IP match", ipMatch],
    ["Overall status", overall],
  ]);

  return [
    tab(
      "check-blacklist",
      "Blacklist",
      details.badges.blacklist,
      blacklistStatus,
      blacklist,
      fields([
        ["Name", details.name],
        ["Email", details.email],
        ["Phone", details.phone],
        ["Mobile", details.mobile],
        ["Address", details.address],
        ["Date of birth", details.dateOfBirth],
        ["Country of residence", details.countryOfResidence],
      ]),
      matchCards,
    ),
    tab(
      "check-eid",
      "EID",
      details.badges.eid,
      val(eid.status, fromCheck(eid, ["Overall Status", "Status"])),
      eid,
      fields([
        ["Name", details.name],
        ["Email", details.email],
        ["Address", details.address],
        ["Date of birth", details.dateOfBirth],
        ["Country of residence", details.countryOfResidence],
        ["Check date/time", fromCheck(eid, ["Check date/time"])],
        ["Performed", fromCheck(eid, ["Performed"])],
        ["Verification result", fromCheck(eid, ["Verification result"])],
        ["Reference Id", fromCheck(eid, ["Reference Id"])],
        ["Overall Status", fromCheck(eid, ["Overall Status", "Status"])],
      ]),
    ),
    tab(
      "check-sanctions",
      "Sanctions",
      details.badges.sanction,
      val(sanction.status, fromCheck(sanction, ["Status"])),
      sanction,
      fields([
        ["Name", details.name],
        ["Country of residence", details.countryOfResidence],
        ["Updated on", fromCheck(sanction, ["Updated on"])],
        ["Updated by", fromCheck(sanction, ["Updated by"])],
        ["Sanction ID", fromCheck(sanction, ["Sanction ID"])],
        ["OFAC List", fromCheck(sanction, ["OFAC List"])],
        ["World check", fromCheck(sanction, ["World check"])],
        ["Status", fromCheck(sanction, ["Status"])],
      ]),
    ),
    tab(
      "check-fraud",
      "FraudPredict",
      details.badges.fraudPredict,
      val(fraud.status, fromCheck(fraud, ["Status"])),
      fraud,
      fields([
        ["Name", details.name],
        ["Email", details.email],
        ["Created on", fromCheck(fraud, ["Created on", "Created"])],
        ["Updated by", fromCheck(fraud, ["Updated by"])],
        ["Fraugster Id", fromCheck(fraud, ["Fraugster Id"])],
        ["Score", fromCheck(fraud, ["Score"])],
        ["Status", fromCheck(fraud, ["Status"])],
      ]),
    ),
    tab(
      "check-custom",
      "Custom checks",
      details.badges.custom,
      val(custom.status, fromCheck(custom, ["Status"])),
      custom,
      fields([
        ["Name", details.name],
        ["IP Address", details.ipAddress],
        ["Country of residence", details.countryOfResidence],
        ["IP City", ip.city],
        ["IP Country", ip.country],
        ["Geo difference", ip.geo],
        ["Check date/time", fromCheck(custom, ["Check date/time"])],
        ["Status", fromCheck(custom, ["Status"])],
      ]),
      undefined,
      custom.rows,
    ),
    tab(
      "check-onfido",
      "Onfido",
      details.badges.onfido,
      val(onfido.status, fromCheck(onfido, ["Status"])),
      onfido,
      fields([
        ["Name", details.name],
        ["Date of birth", details.dateOfBirth],
        ["Updated on", fromCheck(onfido, ["Updated on"])],
        ["Updated by", fromCheck(onfido, ["Updated by"])],
        ["Onfido ID", fromCheck(onfido, ["Onfido ID"])],
        ["Reviewed", fromCheck(onfido, ["Reviewed"])],
        ["Status", fromCheck(onfido, ["Status"])],
      ]),
    ),
    tab(
      "check-docs",
      "Attached documents",
      details.badges.documents,
      documents.rows.length > 0
        ? `${documents.rows.length} document(s)`
        : "No documents",
      documents,
      fields([
        ["Name", details.name],
        ["Client number", details.clientNumber],
        ["Document count", String(documents.rows.length || "0")],
      ]),
      undefined,
      documents.rows,
    ),
  ];
}

export function mapFurtherDetails(details: RegistrationDetails): DetailField[] {
  return fields([
    ["Name", details.name],
    ["Email", details.email],
    ["Phone", details.phone],
    ["Mobile", details.mobile],
    ["Work phone", extraVal(details, ["Work phone"])],
    ["Address", details.address],
    ["Date of birth", details.dateOfBirth],
    ["Country of residence", details.countryOfResidence],
    ["Nationality", details.nationality],
    ["IP Address", details.ipAddress],
    ["Occupation", details.occupation],
    ["Client type", details.clientType],
    ["Organization", details.organization],
    ["Legal Entity", details.legalEntity],
    ["Currency Pair", details.currencyPair],
    ["Source of funds", details.sourceOfFunds],
    ["Purpose of transaction", details.purposeOfTxn],
    ["Estimated transaction value", details.estimatedTxnValue],
    ["Is primary contact", details.primaryContact],
    ["Registration in", extraVal(details, ["Registration in"])],
    ["Registered", extraVal(details, ["Registered"])],
    ["Registration Mode", extraVal(details, ["Registration Mode"])],
    ["Is US client", extraVal(details, ["Is US client"])],
    ["Service required", extraVal(details, ["Service required"])],
    ["Referral text", extraVal(details, ["Referral text"])],
    ["Affiliate name", extraVal(details, ["Affiliate name"])],
    ["Source", extraVal(details, ["Source"])],
  ]);
}
