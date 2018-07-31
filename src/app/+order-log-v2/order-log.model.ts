export enum FilerType {
  Csr            = 0,
  CustomerPoId   = 1,
  RetailerPoId   = 2,
  Customer       = 3,
  DesignName     = 4,
  PartnerStyle   = 5,
  OrderDateFrom  = 6,
  OrderDateTo    = 7,
  StartDateFrom  = 8,
  StartDateTo    = 9,
  CancelDateFrom = 10,
  CancelDateTo   = 11
}

export enum ScheduleColType {
  PrintDate     = 0,
  NeckLabelDate = 1,
  FinishingDate = 2
}

export enum UpdateActualShipType {
  OrderLogAll            = 1,
  OrderLogOutsource      = 2,
  SchedulesShipScheduled = 3,
  SchedulesShipComplete  = 4
}

export interface TextSearch {
  keyword: string;
}

export interface FilterSearch {
  salesOrder: string;
  customerPo: string;
  retailerPo: string;
  customer: string;
  designName: string;
  partnerStyle: string;
  csr: string;
  orderDateBegin: Date;
  orderMyDateBegin?: any;
  orderDateEnd: Date;
  orderMyDateEnd?: any;
  startDateBegin: Date;
  startMyDateBegin?: any;
  startDateEnd: Date;
  startMyDateEnd?: any;
  cancelDateBegin: Date;
  cancelMyDateBegin?: any;
  cancelDateEnd: Date;
  cancelMyDateEnd?: any;
}

export interface SearchObj {
  textSearch: TextSearch;
  filterSearch: FilterSearch;
}

export class SearchObj implements SearchObj {
  constructor() {
    this.textSearch = {
      keyword: undefined
    };
    this.filterSearch = {
      salesOrder: undefined,
      customerPo: undefined,
      retailerPo: undefined,
      customer: undefined,
      designName: undefined,
      partnerStyle: undefined,
      csr: undefined,
      orderDateBegin: undefined,
      orderMyDateBegin: undefined,
      orderDateEnd: undefined,
      orderMyDateEnd: undefined,
      startDateBegin: undefined,
      startMyDateBegin: undefined,
      startDateEnd: undefined,
      startMyDateEnd: undefined,
      cancelDateBegin: undefined,
      cancelMyDateBegin: undefined,
      cancelDateEnd: undefined,
      cancelMyDateEnd: undefined
    };
  }
}
