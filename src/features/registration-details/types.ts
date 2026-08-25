export type CheckBadge = {
  fail?: string;
  pass?: string;
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
  complianceLog: string;
  lastUpdatedBy: string;
  lastUpdatedOn: string;
  locked: boolean;
  owned: boolean;
  lockedBy: string;
  badges: {
    blacklist: CheckBadge;
    eid: CheckBadge;
    sanction: CheckBadge;
    fraudPredict: CheckBadge;
    custom: CheckBadge;
    onfido: CheckBadge;
  };
  error?: string;
};

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
  complianceLog: "",
  lastUpdatedBy: "",
  lastUpdatedOn: "",
  locked: false,
  owned: false,
  lockedBy: "",
  badges: {
    blacklist: {},
    eid: {},
    sanction: {},
    fraudPredict: {},
    custom: {},
    onfido: {},
  },
};
