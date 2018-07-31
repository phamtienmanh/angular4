export interface PurchaseOrderInfo {
  poNumber: string;
  salesOrder: string;
  orderDate: Date;
  dueDate: Date;
  status: string;
}

export interface PurchaseOrderListResp {
  data: PurchaseOrderInfo[];
  totalRecord: number;
}
