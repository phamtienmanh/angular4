export enum TrimUploadedType {
  ArtReceived = 0,
  ArtApproved = 1,
  PoTrim = 2
}

export interface TrimDetail {
  id: number;
  isUseForAllStyles: boolean;
  baseCTrimId: number;
  trimName?: string;
  designId: number;
  designName: string;
  listPurchasing: any[];
  qty: number;
  cTrimId?: number;
  artSentToVendorDateOnUtc: Date;
  artReceivedDateOnUtc: Date;
  artApprovedDateOnUtc: Date;
  isArtRequired: boolean;
  imageUrl: string;
  absoluteUrl: string;
  files: any[];
  isActive?: boolean;
}

export interface Vendor {
  id: number;
  vendorId: number;
  vendorName: string;
  poNumber: number;
  poDateOnUtc: Date;
  poComment: string;
  carrierId: number;
  carrierName: string;
  trackingNumber: string;
  deliverToVendorId: number;
  deliverToVendorName: string;
  shipViaId: number;
  shipViaName: string;
  estDeliveryDateFromOnUtc: Date;
  estDeliveryDateToOnUtc: Date;
  receivedDateFromOnUtc: Date;
  receivedDateToOnUtc: Date;
  checkedDateFromOnUtc: Date;
  checkedDateToOnUtc: Date;
  isShipToTsc: boolean;
  styles: any[];
  files: any[];
  stylesChanges?: any[];
  applyChangesToStyleIds?: any[];
}
