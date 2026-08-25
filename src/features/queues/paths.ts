import { compliancePath } from "@/lib/compliance/paths";

export const portalPaths = {
  regQueue: compliancePath.regQueue,
  payInQueue: compliancePath.payInQueue,
  paymentOutQueue: compliancePath.paymentOutQueue,
  transactionQueue: compliancePath.transactionQueue,
  txnApiQueue: compliancePath.txnApiQueue,
  dataAnonQueue: compliancePath.dataAnonQueue,
  regReport: compliancePath.regReportCriteria,
  txnApiReport: compliancePath.txnApiReport,
  transactionReport: compliancePath.transactionReport,
  paymentInReport: compliancePath.paymentInReportCriteria,
  paymentOutReport: compliancePath.paymentOutReportCriteria,
  workEfficiency: compliancePath.workEfficiencyReport,
  beneReport: compliancePath.beneReportApply,
  registrationDetails: "/registrationDetails",
} as const;
