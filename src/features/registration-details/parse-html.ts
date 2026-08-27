import {
  emptyDetails,
  type CheckBadge,
  type CheckTable,
  type DetailField,
  type OtherPerson,
  type RegistrationDetails,
} from "./types";

function stripTags(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<i[^>]*>\s*check\s*<\/i>/gi, "Pass")
    .replace(/<i[^>]*>\s*clear\s*<\/i>/gi, "Fail")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function dash(value: string): string {
  const text = value.replace(/^[-–—.\s]+$/, "").trim();
  return text.length > 0 ? text : "—";
}

function textById(html: string, id: string): string {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = new RegExp(
    `id=["']${escaped}["'][^>]*>([\\s\\S]*?)</(?:dd|span|p|div|small|strong|a|td|li)>`,
    "i",
  );
  const match = block.exec(html);
  return match?.[1] ? stripTags(match[1]) : "";
}

function badge(html: string, id: string): string | undefined {
  const value = textById(html, id);
  return value || undefined;
}

function pair(html: string, failId: string, passId: string): CheckBadge {
  return {
    fail: badge(html, failId),
    pass: badge(html, passId),
  };
}

function attrValue(html: string, keys: string[]): string {
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(
        `(?:id|name)=["']${escaped}["'][^>]*value=["']([^"']*)["']`,
        "i",
      ),
      new RegExp(
        `value=["']([^"']*)["'][^>]*(?:id|name)=["']${escaped}["']`,
        "i",
      ),
    ];
    for (const pattern of patterns) {
      const match = pattern.exec(html);
      const value = match?.[1] ? stripTags(match[1]) : "";
      if (value) {
        return value;
      }
    }
  }
  return "";
}

function textAfterLabel(html: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<dt[^>]*>\\s*${escaped}\\s*</dt>\\s*<dd[^>]*>([\\s\\S]*?)</dd>`,
    "i",
  );
  const match = pattern.exec(html);
  return match?.[1] ? stripTags(match[1]) : "";
}

function firstText(...values: string[]): string {
  for (const value of values) {
    const text = value.trim();
    if (text && text !== "—") {
      return text;
    }
  }
  return "";
}

function asId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function lockOwner(html: string): {
  locked: boolean;
  owned: boolean;
  lockedBy: string;
} {
  const owned = /You own\(s\) this record/i.test(html);
  const match = /([^<\n]+)\s+own\(s\) this record/i.exec(html);
  const lockedBy = match?.[1] ? stripTags(match[1]) : "";
  const lockedAttr = attrValue(html, ["isRecordLocked"]).toLowerCase();
  return {
    locked: owned || lockedBy.length > 0 || lockedAttr === "true",
    owned,
    lockedBy: owned ? "You" : lockedBy,
  };
}

function cellText(raw: string): string {
  if (/hidden/i.test(raw)) {
    return "";
  }
  if (/type=["']checkbox["']/i.test(raw)) {
    return /checked/i.test(raw) ? "Yes" : "No";
  }
  if (/yes-cell/i.test(raw) || /material-icons[^>]*>\s*check/i.test(raw)) {
    return "Pass";
  }
  if (/no-cell/i.test(raw) || /material-icons[^>]*>\s*clear/i.test(raw)) {
    return "Fail";
  }
  return stripTags(raw);
}

function tableByBody(html: string, tbodyId: string): CheckTable {
  const escaped = tbodyId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tableMatch = new RegExp(
    `<table[\\s\\S]*?<tbody[^>]*id=["']${escaped}["'][^>]*>([\\s\\S]*?)</tbody>`,
    "i",
  ).exec(html);
  const bodyMatch = new RegExp(
    `<tbody[^>]*id=["']${escaped}["'][^>]*>([\\s\\S]*?)</tbody>`,
    "i",
  ).exec(html);
  const body = bodyMatch?.[1] ?? "";
  const tableHtml = tableMatch?.[0] ?? "";
  const headerBlock = /<thead[^>]*>([\s\S]*?)<\/thead>/i.exec(tableHtml)?.[1] ?? "";
  const headers = [...headerBlock.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)]
    .map((item) => stripTags(item[1] ?? ""))
    .filter(Boolean);

  const rows = [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) =>
      [...(row[1] ?? "").matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)]
        .filter((cell) => !/\bhidden\b/i.test(cell[1] ?? ""))
        .map((cell) => cellText(`${cell[1] ?? ""} ${cell[2] ?? ""}`)),
    )
    .filter((row) => row.some((cell) => cell.length > 0));

  return { headers, rows };
}

function parseOtherPeople(html: string): OtherPerson[] {
  const body =
    /<tbody[^>]*id=["']regDetails_OtherPeople["'][^>]*>([\s\S]*?)<\/tbody>/i.exec(
      html,
    )?.[1] ?? "";
  const people: OtherPerson[] = [];
  for (const row of body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const htmlRow = row[1] ?? "";
    const cells = [...htmlRow.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)];
    const hiddenId = cells.find((cell) => /\bhidden\b/i.test(cell[1] ?? ""));
    const visible = cells
      .filter((cell) => !/\bhidden\b/i.test(cell[1] ?? ""))
      .map((cell) => stripTags(cell[2] ?? ""));
    const name = visible[1] ?? "";
    if (!name) {
      continue;
    }
    const click =
      /getRegDetails\(\s*(\d+)\s*,\s*['"]([^'"]*)['"]/i.exec(htmlRow);
    people.push({
      id: click?.[1] ?? (hiddenId ? stripTags(hiddenId[2] ?? "") : undefined),
      status: visible[0] || "—",
      name,
      custType: click?.[2],
    });
  }
  return people;
}

function parseActivityLog(html: string): RegistrationDetails["activityLog"] {
  const body =
    /<tbody[^>]*id=["']activityLog["'][^>]*>([\s\S]*?)<\/tbody>/i.exec(
      html,
    )?.[1] ?? "";
  return [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) => {
      const cells = [...(row[1] ?? "").matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
        (cell) => stripTags(cell[1] ?? ""),
      );
      if (!cells[0] && !cells[2]) {
        return null;
      }
      return {
        date: cells[0] || "—",
        contract: cells[1] || "—",
        user: cells[2] || "—",
        activity: cells[3] || "—",
        activityType: cells[4] || "—",
        comment: cells[5] || "—",
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);
}

function parseFurtherDetails(html: string): DetailField[] {
  const ids: Array<[string, string]> = [
    ["Address", "contact_FurtherClient_Address"],
    ["Registration in", "contact_FurtherClient_regIn"],
    ["Registered", "contact_FurtherClient_regComplete"],
    ["Phone", "contact_FurtherClient_phone"],
    ["Mobile", "contact_FurtherClient_mobile"],
    ["Email", "contact_FurtherClient_email"],
    ["Country of nationality", "contact_FurtherClient_nationality"],
    ["Registration Mode", "account_FurtherClient_regMode"],
    ["Is US client", "contact_FurtherClient_usClient"],
    ["Service required", "account_FurtherClient_serviceReq"],
    ["IP Address", "contact_FurtherClient_ipAddress"],
    ["Referral text", "account_FurtherClient_refferalText"],
    ["Affiliate name", "account_FurtherClient_affiliateName"],
    ["Source", "account_source"],
    ["Work phone", "account_FurtherClient_affiliateName"],
  ];
  const seen = new Set<string>();
  const fields: DetailField[] = [];
  for (const [label, id] of ids) {
    if (seen.has(label)) {
      continue;
    }
    const value = dash(textById(html, id) || textAfterLabel(html, label));
    if (value === "—") {
      continue;
    }
    seen.add(label);
    fields.push({ label, value });
  }
  return fields;
}

function checkboxValues(html: string, name: string, selectedOnly = false): string[] {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [
    ...html.matchAll(
      new RegExp(
        `<input[^>]*name=["']${escaped}["'][^>]*>|<input[^>]*name=["']${escaped}["'][^/]*/>`,
        "gi",
      ),
    ),
  ];
  const values: string[] = [];
  for (const match of matches) {
    const tag = match[0];
    if (selectedOnly && !/\bchecked\b/i.test(tag)) {
      continue;
    }
    const value = /value=["']([^"']*)["']/i.exec(tag)?.[1];
    if (value) {
      values.push(stripTags(value));
    }
  }
  return values;
}

export function parseRegistrationDetailsHtml(
  html: string,
): RegistrationDetails {
  const lastUpdated =
    /Last updated by\s*<strong>([\s\S]*?)<\/strong>\s*on\s*([^<]+)/i.exec(html);
  const owner = lockOwner(html);
  const status =
    textById(html, "contact_compliacneStatus") ||
    textById(html, "account_compliacneStatus") ||
    attrValue(html, ["contactStatus", "complianceStatus"]) ||
    "INACTIVE";
  const custType =
    textById(html, "account_clientType") ||
    attrValue(html, ["custType", "clientType", "customerType"]) ||
    "PERSONAL";
  const organization =
    textById(html, "account_organisation") ||
    attrValue(html, [
      "orgCode",
      "organisation",
      "organization",
      "orgganizationCode",
    ]);
  const email = firstText(
    textById(html, "contact_email"),
    textById(html, "contact_FurtherClient_email"),
    textAfterLabel(html, "Email address"),
    textAfterLabel(html, "Email"),
  );
  const legalEntity = firstText(
    textAfterLabel(html, "Legal Entity"),
    textById(html, "account_legalEntity"),
  );
  const documents = tableByBody(html, "attachDoc");
  const otherPeople = parseOtherPeople(html);
  const docCount =
    textById(html, "docConunt") ||
    (documents.rows.length > 0 ? String(documents.rows.length) : "");
  const otherCount =
    textById(html, "regDetails_otherConCount") ||
    (otherPeople.length > 0 ? String(otherPeople.length) : "");

  return {
    ...emptyDetails,
    contactId: asId(
      attrValue(html, [
        "contact_contactId",
        "contactId",
        "contact_id",
        "entityId",
      ]),
    ),
    accountId: asId(
      attrValue(html, ["contact_accountId", "accountId", "account_id"]),
    ),
    userResourceId: asId(
      attrValue(html, [
        "userResourceId",
        "userResourceLockId",
        "lockId",
        "user_resource_id",
      ]),
    ),
    orgCode: organization,
    custType,
    preContactStatus: status,
    preAccountStatus: status,
    clientNumber: dash(
      textById(html, "account_tradeAccountNum").replace(/^Client\s*#\s*/i, ""),
    ),
    status,
    name: dash(
      textById(html, "contact_name") ||
        textById(html, "account-name") ||
        textAfterLabel(html, "Name"),
    ),
    clientType: dash(custType),
    occupation: dash(
      textById(html, "contact_occupation") ||
        textAfterLabel(html, "Occupation"),
    ),
    email: dash(email),
    legalEntity: dash(legalEntity),
    dateOfBirth: dash(
      textById(html, "contact_dateofbirth") ||
        textAfterLabel(html, "Date of birth"),
    ),
    currencyPair: dash(
      textById(html, "account_currencyPair") ||
        textAfterLabel(html, "Currency Pair"),
    ),
    estimatedTxnValue: dash(
      textById(html, "account_estimatedTxnValue") ||
        textAfterLabel(html, "Estimated transaction value"),
    ),
    purposeOfTxn: dash(
      textById(html, "account_purposeOfTxn") ||
        textAfterLabel(html, "Purpose of transaction"),
    ),
    aiEtvBand:
      textById(html, "account_conversionpredictionetvband") ||
      textAfterLabel(html, "AI ETV Band") ||
      "----",
    countryOfResidence: dash(
      textById(html, "contact_countryOfResidence") ||
        textAfterLabel(html, "Country of residence"),
    ),
    organization: dash(organization),
    sourceOfFunds: dash(
      textById(html, "account_sourceOfFunds") ||
        textAfterLabel(html, "Source of funds"),
    ),
    primaryContact: dash(
      textById(html, "is_primaryContact") ||
        textAfterLabel(html, "Is primary contact"),
    ),
    complianceLog: textById(html, "regDetails_alert_compliance_log"),
    lastUpdatedBy: lastUpdated?.[1] ? stripTags(lastUpdated[1]) : "",
    lastUpdatedOn: lastUpdated?.[2]?.trim() ?? "",
    locked: owner.locked,
    owned: owner.owned,
    lockedBy: owner.lockedBy,
    otherPeopleCount: otherCount,
    documentsCount: docCount,
    watchlists: checkboxValues(html, "regDetails_watchlist[]"),
    statusReasons: checkboxValues(html, "regDetails_contactStatusReson[]"),
    selectedReasons: checkboxValues(
      html,
      "regDetails_contactStatusReson[]",
      true,
    ),
    furtherDetails: parseFurtherDetails(html),
    otherPeople,
    activityLog: parseActivityLog(html),
    checks: {
      blacklist: tableByBody(html, "regDetails_blacklist"),
      eid: tableByBody(html, "regDetails_eid"),
      sanction: tableByBody(html, "regDetails_sanction"),
      fraudPredict: tableByBody(html, "regDetails_fraugster"),
      custom: tableByBody(html, "regDetails_customchecks"),
      onfido: tableByBody(html, "regDetails_onfido"),
      documents,
    },
    badges: {
      blacklist: pair(html, "regDetails_blackPass", "regDetails_blackNeg"),
      eid: pair(html, "regDetails_kycPass", "regDetails_kycNeg"),
      sanction: pair(
        html,
        "regDetails_sanctionPass",
        "regDetails_sanctionNeg",
      ),
      fraudPredict: pair(
        html,
        "regDetails_fraugsterFail",
        "regDetails_fraugsterPass",
      ),
      custom: pair(html, "regDetails_custPass", "regDetails_custNeg"),
      onfido: pair(html, "regDetails_onfidoPass", "regDetails_onfidoNeg"),
      documents: { count: docCount || undefined },
      otherPeople: { count: otherCount || undefined },
    },
  };
}
