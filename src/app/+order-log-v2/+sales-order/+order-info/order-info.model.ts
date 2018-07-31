import {
  UploadedFileModel
} from '../sales-order.model';

export enum OrderInfoUploadedType {
  CustomerPO   = 0,
  Customer2PO  = 1,
  ProductionPO = 2,
  FactoryPO    = 3
}

export interface SizesQty {
  name: string;
  qty: number;
}

export interface OrderDetail {
  id: number;
  styleName: string;
  vendorName: string;
  vendorStyle: string;
  images: string[];
  sizes: SizesQty[];
  status: string;
  partnerStyle: string;
  estDeliveryDateToOnUtc: Date;
  estDeliveryDateFromOnUtc: Date;
}

export interface SalesOrderInfo {
  id?: number;
  csr: number;
  customerId: number;
  customerName: string;
  customerPoId: string;
  orderDateOnUtc: Date;
  vendorId: number;
  vendorName: string;
  customer2Type: number;
  customer2TypeName?: string | number;
  retailerId: number;
  retailerName: string;
  retailerPoId: string;
  orderTypeId: number;
  orderType: string;
  isA2000Order: boolean;
  isEdi?: boolean;
  isCreditApproved: boolean;
  isFullPackage: boolean;
  isPublished: boolean;
  isCancelled: boolean;
  a2000CutTicketId: string;
  cutTicketCreatedOnUtc: Date;
  fulfillmentType: any;
  startShipDateOnUtc: Date;
  endShipDateOnUtc: Date;
  cancelDateOnUtc: Date;
  dropShipId: number;
  dropShipName: string;
  transitTime: number;
  lastDateToShipOnUtc: Date;
  shipMethod: string;
  comments: number;
  // isCustomCutAndSew: boolean;
  noTrimRequired: boolean;
  factoryId: number;
  factoryName: string;
  exFactoryDateOnUtc: Date;
  etaTscDateOnUtc: Date;
  orderFiles: UploadedFileModel[];
}

export interface OrderResponse {
  data: SalesOrderInfo[];
  totalRecord: number;
}
