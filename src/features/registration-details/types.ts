export type CheckBadge = {
  fail?: string;
  pass?: string;
};

export type RegistrationDetails = {
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
  badges: {
    blacklist: {},
    eid: {},
    sanction: {},
    fraudPredict: {},
    custom: {},
    onfido: {},
  },
};
