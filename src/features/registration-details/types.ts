export type CheckBadge = {
  fail?: string;
  pass?: string;
  count?: string;
};

export type CheckTable = {
  status?: string;
  fields?: DetailField[];
  cards?: DetailField[];
  headers: string[];
  rows: string[][];
};

export type OtherPerson = {
  id?: string;
  status: string;
  name: string;
  custType?: string;
};

export type ActivityLogRow = {
  date: string;
  contract: string;
  user: string;
  activity: string;
  activityType: string;
  comment: string;
};

export type DetailField = {
  label: string;
  value: string;
};

export type RegistrationDetails = {
  contactId: number | null;
  accountId: number | null;
  userResourceId: number | null;
  orgCode: string;
  custType: string;
  preContactStatus: string;
  preAccountStatus: string;
  clientNumber: string;
  status: string;
  name: string;
  clientType: string;
  occupation: string;
  email: string;
  legalEntity: string;
  dateOfBirth: string;
  currencyPair: string;
  estimatedTxnValue: string;
  purposeOfTxn: string;
  aiEtvBand: string;
  countryOfResidence: string;
  organization: string;
  sourceOfFunds: string;
  primaryContact: string;
  phone: string;
  mobile: string;
  address: string;
  nationality: string;
  ipAddress: string;
  complianceLog: string;
  lastUpdatedBy: string;
  lastUpdatedOn: string;
  locked: boolean;
  owned: boolean;
  lockedBy: string;
  source: "QUEUE" | "REPORT";
  otherPeopleCount: string;
  documentsCount: string;
  watchlists: string[];
  statusReasons: string[];
  selectedReasons: string[];
  furtherDetails: DetailField[];
  otherPeople: OtherPerson[];
  activityLog: ActivityLogRow[];
  checks: {
    blacklist: CheckTable;
    eid: CheckTable;
    sanction: CheckTable;
    fraudPredict: CheckTable;
    custom: CheckTable;
    onfido: CheckTable;
    documents: CheckTable;
  };
  badges: {
    blacklist: CheckBadge;
    eid: CheckBadge;
    sanction: CheckBadge;
    fraudPredict: CheckBadge;
    custom: CheckBadge;
    onfido: CheckBadge;
    documents: CheckBadge;
    otherPeople: CheckBadge;
  };
  error?: string;
};

const emptyTable = (headers: string[] = []): CheckTable => ({
  status: "",
  fields: headers.map((label) => ({ label, value: "—" })),
  headers,
  rows: [],
});

export const emptyDetails: RegistrationDetails = {
  contactId: null,
  accountId: null,
  userResourceId: null,
  orgCode: "",
  custType: "PERSONAL",
  preContactStatus: "PENDING",
  preAccountStatus: "PENDING",
  clientNumber: "",
  status: "INACTIVE",
  name: "—",
  clientType: "—",
  occupation: "—",
  email: "—",
  legalEntity: "—",
  dateOfBirth: "—",
  currencyPair: "—",
  estimatedTxnValue: "—",
  purposeOfTxn: "—",
  aiEtvBand: "----",
  countryOfResidence: "—",
  organization: "—",
  sourceOfFunds: "—",
  primaryContact: "—",
  phone: "—",
  mobile: "—",
  address: "—",
  nationality: "—",
  ipAddress: "—",
  complianceLog: "",
  lastUpdatedBy: "",
  lastUpdatedOn: "",
  locked: false,
  owned: false,
  lockedBy: "",
  source: "QUEUE",
  otherPeopleCount: "",
  documentsCount: "",
  watchlists: [],
  statusReasons: [],
  selectedReasons: [],
  furtherDetails: [],
  otherPeople: [],
  activityLog: [],
  checks: {
    blacklist: emptyTable([
      "Name match",
      "Phone match",
      "Email match",
      "Domain match",
      "IP match",
      "Overall status",
    ]),
    eid: emptyTable([
      "Check date/time",
      "Performed",
      "Verification result",
      "Reference Id",
      "Date of birth",
      "Overall Status",
    ]),
    sanction: emptyTable([
      "Updated on",
      "Updated by",
      "Sanction ID",
      "OFAC List",
      "World check",
      "Status",
    ]),
    fraudPredict: emptyTable([
      "Created on",
      "Updated by",
      "Fraugster Id",
      "Score",
      "Status",
    ]),
    custom: emptyTable(["Check date/time", "Rules", "Status"]),
    onfido: emptyTable([
      "Updated on",
      "Updated by",
      "Onfido ID",
      "Reviewed",
      "Status",
    ]),
    documents: emptyTable([
      "Created on",
      "Created by",
      "Document name",
      "Type",
      "Note",
      "Status",
    ]),
  },
  badges: {
    blacklist: {},
    eid: {},
    sanction: {},
    fraudPredict: {},
    custom: {},
    onfido: {},
    documents: {},
    otherPeople: {},
  },
};
