import { isRecord, readNumber, readString } from "@/lib/utils/guards";

import type {
  CustomerSlice,
  DashboardData,
  Fulfilment,
  FulfilmentSlice,
  GeographyRow,
  LegalEntityRow,
  PaymentSlice,
  Timeline,
} from "./data";

const SECTION_HEADINGS = [
  "PERSONAL onboarding by geography",
  "PERSONAL registration by legal entity",
  "PERSONAL registration fulfilment (Today)",
  "PERSONAL registration timeline snapshot",
  "Inward by legal entity",
  "Inward fulfilment (Today)",
  "Inward timeline snapshot",
  "CORPORATE onboarding by geography",
  "CORPORATE registration by legal entity",
  "CORPORATE registration fulfilment (Today)",
  "CORPORATE registration timeline snapshot",
  "Outward by legal entity",
  "Outward fulfilment (Today)",
  "Outward timeline snapshot",
] as const;

function decodeHtml(value: string): string {
  return value
    .replace(/&quot;/gi, '"')
    .replace(/&#0*34;/g, '"')
    .replace(/&#x0*22;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
}

function toCount(value: string | undefined): number {
  const parsed = readNumber(value?.replace(/,/g, "").trim() ?? "");
  return parsed ?? 0;
}

function isDashboardHtml(html: string): boolean {
  return (
    html.includes("atlas-kpi-card") ||
    html.includes("regPersonalByGeographyJsonStringId") ||
    html.includes("page-registration")
  );
}

function kpiValue(html: string, label: string): number {
  const pattern = new RegExp(
    `atlas-kpi-card__label">${label}<\\/span>\\s*<span class="atlas-kpi-card__value">([^<]*)`,
    "i",
  );
  return toCount(pattern.exec(html)?.[1]);
}

function firstInt(html: string, pattern: RegExp): number {
  return toCount(pattern.exec(html)?.[1]);
}

function hiddenValue(html: string, id: string): string {
  const afterId = new RegExp(
    `id="${id}"[^>]*value=(["'])([\\s\\S]*?)\\1`,
    "i",
  );
  const beforeId = new RegExp(
    `value=(["'])([\\s\\S]*?)\\1[^>]*id="${id}"`,
    "i",
  );
  const match = afterId.exec(html) ?? beforeId.exec(html);
  return decodeHtml(match?.[2] ?? "");
}

function parseJsonValue(raw: string): unknown {
  if (!raw || raw === "null") {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function sectionBetween(
  html: string,
  heading: string,
  nextHeading?: string,
): string {
  const start = html.indexOf(heading);
  if (start < 0) {
    return "";
  }
  const from = start + heading.length;
  const end = nextHeading ? html.indexOf(nextHeading, from) : html.length;
  return html.slice(from, end < 0 ? html.length : end);
}

function dashNumbers(section: string): number[] {
  const values: number[] = [];
  const pattern =
    /(\d[\d,]*)\s*<span class="dash-number__text">[^<]*<\/span>/gi;
  for (const match of section.matchAll(pattern)) {
    values.push(toCount(match[1]));
  }
  return values;
}

function labelledNumber(section: string, label: string): number {
  const pattern = new RegExp(
    `${label}[\\s\\S]*?(\\d[\\d,]*)\\s*<span class="dash-number__text">`,
    "i",
  );
  return toCount(pattern.exec(section)?.[1]);
}

function parseGeographyTable(section: string): GeographyRow[] {
  const rows: GeographyRow[] = [];
  const pattern =
    /<tr>\s*<td>([^<]*)<\/td>\s*<td[^>]*>([^<]*)<\/td>\s*<\/tr>/gi;
  for (const match of section.matchAll(pattern)) {
    const country = decodeHtml(match[1] ?? "");
    if (!country || country.toLowerCase() === "country") {
      continue;
    }
    rows.push({ country, count: toCount(match[2]) });
  }
  return rows;
}

function parseGeographyJson(raw: string): GeographyRow[] {
  const parsed = parseJsonValue(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const rows: GeographyRow[] = [];
  for (const item of parsed) {
    if (!isRecord(item)) {
      continue;
    }
    const country =
      readString(item.countryName)?.trim() ||
      readString(item.title)?.trim() ||
      readString(item.id)?.trim() ||
      "";
    if (!country) {
      continue;
    }
    rows.push({
      country,
      count: readNumber(item.value) ?? 0,
      countryCode: readString(item.id)?.trim(),
    });
  }
  return rows;
}

function parseLegalEntityJson(raw: string): LegalEntityRow[] {
  const parsed = parseJsonValue(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const rows: LegalEntityRow[] = [];
  for (const item of parsed) {
    if (!isRecord(item)) {
      continue;
    }
    const legalEntity =
      readString(item.legalEntity)?.trim() ||
      readString(item.title)?.trim() ||
      "";
    if (!legalEntity) {
      continue;
    }
    rows.push({
      legalEntity,
      visits: readNumber(item.visits) ?? readNumber(item.value) ?? 0,
    });
  }
  return rows;
}

function parseFulfilmentGraph(raw: string): FulfilmentSlice[] {
  const parsed = parseJsonValue(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const rows: FulfilmentSlice[] = [];
  for (const item of parsed) {
    if (!isRecord(item)) {
      continue;
    }
    const title = readString(item.title)?.trim();
    if (!title) {
      continue;
    }
    rows.push({
      title,
      value: readNumber(item.value) ?? 0,
    });
  }
  return rows;
}

function mergeGeography(
  tableRows: GeographyRow[],
  jsonRows: GeographyRow[],
): GeographyRow[] {
  if (tableRows.length === 0) {
    return jsonRows;
  }
  if (jsonRows.length === 0) {
    return tableRows;
  }

  const byName = new Map(
    jsonRows.map((row) => [row.country.toLowerCase(), row]),
  );
  return tableRows.map((row) => {
    const match =
      byName.get(row.country.toLowerCase()) ??
      jsonRows.find(
        (item) => item.countryCode?.toLowerCase() === row.country.toLowerCase(),
      );
    return {
      ...row,
      countryCode: match?.countryCode,
    };
  });
}

function fulfilmentFrom(
  section: string,
  graph: FulfilmentSlice[],
): Fulfilment {
  const numbers = dashNumbers(section);
  return {
    avgClearingTime:
      labelledNumber(section, "Average clearing time") || numbers[0] || 0,
    avgPerHour: labelledNumber(section, "Average per hour") || numbers[1] || 0,
    clearedToday: labelledNumber(section, "Cleared today") || numbers[2] || 0,
    graph,
  };
}

function timelineFrom(section: string, unit: Timeline["unit"]): Timeline {
  const numbers = dashNumbers(section);
  return {
    oldest: labelledNumber(section, "Oldest record") || numbers[0] || 0,
    average: labelledNumber(section, "Average record age") || numbers[1] || 0,
    newest: labelledNumber(section, "Newest record") || numbers[2] || 0,
    unit,
  };
}

function customerSlice(
  total: number,
  percent: number,
  geography: GeographyRow[],
  legalEntities: LegalEntityRow[],
  fulfilment: Fulfilment,
  timeline: Timeline,
): CustomerSlice {
  return {
    total,
    percent,
    geography,
    legalEntities,
    fulfilment,
    timeline,
  };
}

function paymentSlice(
  total: number,
  legalEntities: LegalEntityRow[],
  fulfilment: Fulfilment,
  timeline: Timeline,
): PaymentSlice {
  return { total, legalEntities, fulfilment, timeline };
}

export function parseDashboardHtml(html: string): DashboardData | null {
  if (!isDashboardHtml(html)) {
    return null;
  }

  html = html.replace(/<!--[\s\S]*?-->/g, "");

  const sections = Object.fromEntries(
    SECTION_HEADINGS.map((heading, index) => [
      heading,
      sectionBetween(html, heading, SECTION_HEADINGS[index + 1]),
    ]),
  ) as Record<(typeof SECTION_HEADINGS)[number], string>;

  const personalGeo = mergeGeography(
    parseGeographyTable(sections["PERSONAL onboarding by geography"]),
    parseGeographyJson(hiddenValue(html, "regPersonalByGeographyJsonStringId")),
  );
  const corporateGeo = mergeGeography(
    parseGeographyTable(sections["CORPORATE onboarding by geography"]),
    parseGeographyJson(
      hiddenValue(html, "regCorporateByGeographyJsonStringId"),
    ),
  );

  const personalTotal = firstInt(
    html,
    /(\d[\d,]*)\s+PERSONAL records/i,
  );
  const corporateTotal = firstInt(
    html,
    /(\d[\d,]*)\s+CORPORATE records/i,
  );
  const percentMatches = [
    ...html.matchAll(/\((\d+)% of queue\)/gi),
  ].map((match) => toCount(match[1]));

  const onboardingTotal =
    kpiValue(html, "Onboarding") ||
    firstInt(html, /(\d[\d,]*)\s+onboarding records/i) ||
    personalTotal + corporateTotal;
  const inwardTotal =
    kpiValue(html, "Inward") ||
    firstInt(html, /(\d[\d,]*)\s+payments in records/i);
  const outwardTotal =
    kpiValue(html, "Outward") ||
    firstInt(html, /(\d[\d,]*)\s+payments out records/i);

  const refreshOn =
    /Last updated @\s*([0-9]{1,2}:[0-9]{2}:[0-9]{2})/i.exec(html)?.[1] ?? "";

  return {
    onboardingTotal,
    inwardTotal,
    outwardTotal,
    refreshOn,
    personal: customerSlice(
      personalTotal,
      percentMatches[0] ?? 0,
      personalGeo,
      parseLegalEntityJson(
        hiddenValue(html, "regPersonalByBusinessUnitJsonStringId"),
      ),
      fulfilmentFrom(
        sections["PERSONAL registration fulfilment (Today)"],
        parseFulfilmentGraph(
          hiddenValue(html, "regPersonalFulfilmentJsonStringId"),
        ),
      ),
      timelineFrom(
        sections["PERSONAL registration timeline snapshot"],
        "days",
      ),
    ),
    corporate: customerSlice(
      corporateTotal,
      percentMatches[1] ?? 0,
      corporateGeo,
      parseLegalEntityJson(
        hiddenValue(html, "regCorporateByBusinessUnitJsonStringId"),
      ),
      fulfilmentFrom(
        sections["CORPORATE registration fulfilment (Today)"],
        parseFulfilmentGraph(
          hiddenValue(html, "regCorporateFulfilmentJsonStringId"),
        ),
      ),
      timelineFrom(
        sections["CORPORATE registration timeline snapshot"],
        "days",
      ),
    ),
    inward: paymentSlice(
      inwardTotal,
      parseLegalEntityJson(
        hiddenValue(html, "paymentInBusinessUnitJsonStringId"),
      ),
      fulfilmentFrom(
        sections["Inward fulfilment (Today)"],
        parseFulfilmentGraph(
          hiddenValue(html, "paymentInFulfilmentJsonStringId"),
        ),
      ),
      timelineFrom(sections["Inward timeline snapshot"], "minutes"),
    ),
    outward: paymentSlice(
      outwardTotal,
      parseLegalEntityJson(
        hiddenValue(html, "paymentOutBusinessUnitJsonStringId"),
      ),
      fulfilmentFrom(
        sections["Outward fulfilment (Today)"],
        parseFulfilmentGraph(
          hiddenValue(html, "paymentOutFulfilmentJsonStringId"),
        ),
      ),
      timelineFrom(sections["Outward timeline snapshot"], "minutes"),
    ),
  };
}
