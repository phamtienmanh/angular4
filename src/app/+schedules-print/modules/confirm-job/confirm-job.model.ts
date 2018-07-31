export interface SalesOrderDetail {
  salesOrderQtys: SizeQty[];
  sampleQtys: SizeQty[];
  topQtys: SizeQty[];
  productionQtys: SizeQty[];
}

export interface SizeQty {
  name: string;
  isIncommpleted: boolean;
  qty: number;
}

export interface JobDetail {
  scheduledDateOnUtc: string;
  completedTimeOnUtc: string;
  confirmedBy: string;
  startedTimeOnUtc: string;
  machineName: string;
  isThisJob: boolean;
  isNotScheduled: boolean;
  scheduledQtys: SizeQty[];
  damagedQtys: SizeQty[];
  firstQualityPrintQtys: SizeQty[];
  unScheduledQtys: SizeQty[];
}

export interface ConfirmJobModel {
  salesOrderDetail: SalesOrderDetail;
  jobs: JobDetail[];
}
