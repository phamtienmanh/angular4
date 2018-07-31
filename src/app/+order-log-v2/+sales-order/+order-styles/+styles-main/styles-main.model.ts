export interface BasicPrintLocation {
  id: number;
  locationName: string;
}

export interface BasicTrims {
  id: number;
  trimName: string;
}

export interface SizesQty {
  size: string;
  type: string;
  qty: number;
}

export interface StyleInfo {
  id: number;
  colorId: number;
  colorName: string;
  estDeliveryDateFromOnUtc: string;
  estDeliveryDateToOnUtc: string;
  partnerStyleName: string;
  printLocations: BasicPrintLocation[];
  sizes: SizesQty[];
  status: string;
  styleName: string;
  trims: BasicTrims[];
  vendorId: number;
  vendorName: string;
  vendorStyleName: string;
}

export interface StyleResponse {
  data: StyleInfo[];
  totalRecord: number;
}
