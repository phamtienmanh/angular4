import { BasicGeneralInfo } from '../shared/models';

export interface CustomBasicInfo extends BasicGeneralInfo {
  isEnabled: boolean;
}

export interface CustomBasicInfoList {
  data: CustomBasicInfo[];
  totalRecord: number;
}

export enum FilterType {
  Csr = 0,
  CustomerPoId = 1,
  RetailerPoId = 2,
  Customer = 3,
  StyleName = 4,
  PartnerStyle = 5,
  OrderDateFrom = 6,
  OrderDateTo = 7,
  StartDateFrom = 8,
  StartDateTo = 9,
  CancelDateFrom = 10,
  CancelDateTo = 11,
  ShipDateFrom = 12,
  ShipDateTo = 13,
  StatusType = 14,
  Status = 15,
  ItemType = 16,
  OrderType = 17,
  ExcludeSmpl = 18,
  ProjectName = 19,
  ProductDescription = 20,
  FactoryId = 21,
  RetailerName = 22,
  LicensorId = 23,
  LicenseeId = 24
}
