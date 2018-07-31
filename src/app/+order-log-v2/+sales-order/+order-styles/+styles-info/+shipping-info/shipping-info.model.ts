export enum ShippingUploadType {
  BOL         = 0,
  PackingList = 1,
  Other       = 2,
  Freight     = 3
}

export interface SalesShippingInfo {
  shipDateOnUtc: Date;
  shipFromId: number;
  shipFromName: string;
  bolNumber: string;
  shipViaId: number;
  shipViaName: string;
  trackingNumber: string;
  deliveryEtaDateOnUtc: Date;
  deliveryConfirmedDateOnUtc: Date;
}
