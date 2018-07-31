import {
  SalesOrderInfo
} from './+order-info';

export * from '../../shared/models/upload-type.model';

export interface UploadedFileModel {
  id: number;
  type: number;
  typeName: string;
  fileName: string;
  fileUrl: string;
}

export interface SalesOrder {
  orderInfo: SalesOrderInfo;
  orderFileModel: UploadedFileModel[];
  // shippingInfo: SalesShippingInfo;
  // designs: SalesDesignInfo[];
}
