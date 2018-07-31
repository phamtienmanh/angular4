export interface SaleOrderInfo {
  orderId: number;
  customerPoId: string;
  orderDate: Date;
  dueDate: Date;
  orderType: string;
  status: string;
}
export interface SalesOrderListResp {
  data: SaleOrderInfo[];
  totalRecord: number;
}
