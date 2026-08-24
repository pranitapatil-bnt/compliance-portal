import {
  emptyDetails,
  type CheckBadge,
  type RegistrationDetails,
} from "./types";

function stripTags(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function dash(value: string): string {
  return value.length > 0 ? value : "—";
}

function textById(html: string, id: string): string {
  const block = new RegExp(
    `id=["']${id}["'][^>]*>([\\s\\S]*?)</(?:dd|span|p|div|small|strong|a|td)>`,
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

export function parseRegistrationDetailsHtml(
  html: string,
): RegistrationDetails {
  const lastUpdated =
    /Last updated by\s*<strong>([\s\S]*?)<\/strong>\s*on\s*([^<]+)/i.exec(html);

  return {
    ...emptyDetails,
    clientNumber: dash(
      textById(html, "account_tradeAccountNum").replace(/^Client\s*#\s*/i, ""),
    ),
    status: textById(html, "contact_compliacneStatus") || "INACTIVE",
    name: dash(textById(html, "contact_name")),
    clientType: dash(textById(html, "account_clientType")),
    occupation: dash(textById(html, "contact_occupation")),
    email: dash(
      textById(html, "contact_email") ||
        (html.match(/Email address<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i)?.[1]
          ? stripTags(
              html.match(
                /Email address<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i,
              )?.[1] ?? "",
            )
          : ""),
    ),
    legalEntity: dash(
      html.match(/Legal Entity<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i)?.[1]
        ? stripTags(
            html.match(
              /Legal Entity<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i,
            )?.[1] ?? "",
          )
        : "",
    ),
    dateOfBirth: dash(textById(html, "contact_dateofbirth")),
    currencyPair: dash(textById(html, "account_currencyPair")),
    estimatedTxnValue: dash(textById(html, "account_estimatedTxnValue")),
    purposeOfTxn: dash(textById(html, "account_purposeOfTxn")),
    aiEtvBand: textById(html, "account_conversionpredictionetvband") || "----",
    countryOfResidence: dash(textById(html, "contact_countryOfResidence")),
    organization: dash(textById(html, "account_organisation")),
    sourceOfFunds: dash(textById(html, "account_sourceOfFunds")),
    primaryContact: dash(textById(html, "is_primaryContact")),
    complianceLog: textById(html, "regDetails_alert_compliance_log"),
    lastUpdatedBy: lastUpdated?.[1] ? stripTags(lastUpdated[1]) : "",
    lastUpdatedOn: lastUpdated?.[2]?.trim() ?? "",
    locked: /You own\(s\) this record/i.test(html),
    badges: {
      blacklist: pair(html, "regDetails_blackPass", "regDetails_blackNeg"),
      eid: pair(html, "regDetails_kycPass", "regDetails_kycNeg"),
      sanction: {
        fail: html.match(
          /regDetails_sanction_indicatior[\s\S]*?indicator--negative[^>]*>([^<]+)/i,
        )?.[1],
        pass: html.match(
          /regDetails_sanction_indicatior[\s\S]*?indicator--positive[^>]*>([^<]+)/i,
        )?.[1],
      },
      fraudPredict: {
        fail: html.match(
          /regDetails_fraugster_indicatior[\s\S]*?indicator--negative[^>]*>([^<]+)/i,
        )?.[1],
        pass: html.match(
          /regDetails_fraugster_indicatior[\s\S]*?indicator--positive[^>]*>([^<]+)/i,
        )?.[1],
      },
      custom: {
        fail: html.match(
          /regDetails_customcheck_indicatior[\s\S]*?indicator--negative[^>]*>([^<]+)/i,
        )?.[1],
        pass: html.match(
          /regDetails_customcheck_indicatior[\s\S]*?indicator--positive[^>]*>([^<]+)/i,
        )?.[1],
      },
      onfido: {
        fail: html.match(
          /regDetails_onfido_indicatior[\s\S]*?indicator--negative[^>]*>([^<]+)/i,
        )?.[1],
        pass: html.match(
          /regDetails_onfido_indicatior[\s\S]*?indicator--positive[^>]*>([^<]+)/i,
        )?.[1],
      },
    },
  };
}
