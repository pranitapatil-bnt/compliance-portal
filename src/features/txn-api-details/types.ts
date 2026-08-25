export type TxnApiDetailField = {
  label: string;
  value: string;
};

export type TxnApiDetailSection = {
  title: string;
  fields: TxnApiDetailField[];
};

export type TxnApiDetails = {
  transactionId: string;
  source: "REPORT" | "QUEUE";
  title: string;
  status: string;
  sections: TxnApiDetailSection[];
  error?: string;
};
