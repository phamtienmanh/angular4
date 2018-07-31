export * from '../shared/models/column-status.model';

export enum SchedulesType {
  Scheduler = 0,
  Print = 1,
  NeckLabel = 2,
  Finishing = 3,
  PendingSamples = 4,
  Samples = 5,
  Shipping = 6,
  TopPpSamples = 7
}

export enum FilerType {
  SaleOrderId = 0,
  CustomerPoId = 1,
  RetailerPoId = 2,
  Customer = 3,
  StyleName = 4,
  Csr = 5,
  OrderDateFrom = 6,
  OrderDateTo = 7,
  StartDateFrom = 8,
  StartDateTo = 9,
  CancelDateFrom = 10,
  CancelDateTo = 11
}

export const MachineList = [
  {id: 1, name: '1'},
  {id: 2, name: '2'},
  {id: 3, name: '3'},
  {id: 4, name: '4'},
  {id: 5, name: 'NECK LABEL 1'},
  {id: 6, name: 'NECK LABEL 2'}
];

export const ColConfigKey = {
  SchedulesPrint: 'SCHEDULES_PRINT_COLUMN_CONFIG',
  SchedulesOutsourcePrint: 'SCHEDULES_OUTSOURCEPRINT_COLUMN_CONFIG',
  SchedulesNeckLabel: 'SCHEDULES_NECKLABEL_COLUMN_CONFIG',
  SchedulesFinishing: 'SCHEDULES_FINISHING_COLUMN_CONFIG',
  SchedulesOutsourceFinishing: 'SCHEDULES_OUTSOURCEFINISHING_COLUMN_CONFIG',
  SchedulesPendingSamples: 'SCHEDULES_PENDINGSAMPLES_COLUMN_CONFIG',
  SchedulesSamples: 'SCHEDULES_SAMPLES_COLUMN_CONFIG',
  SchedulesShipScheduled: 'SCHEDULES_SHIPPING_SHIP_SCHEDULED_COLUMN_CONFIG',
  SchedulesShipComplete: 'SCHEDULES_SHIPPING_SHIP_COMPLETE_COLUMN_CONFIG',
  SchedulesTopPpSamples: 'SCHEDULES_TOPPPSAMPLES_COLUMN_CONFIG'
};

export const HourOffset = -5;
