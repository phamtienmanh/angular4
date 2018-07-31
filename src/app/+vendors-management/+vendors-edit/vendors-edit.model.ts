import {
  ReminderInfo
} from '../+vendors-detail/edit-reminder';
export interface BasicVendor {
  id: number;
  company: string;
}
export interface ContactInfo {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cell: string;
  role: number;
  roleName: string;
}
export interface SaleOrderInfo {
  orderId: number;
  customerPoId: string;
  orderDate: Date;
  dueDate: Date;
  orderType: string;
  status: string;
}
export interface VendorInfo extends BasicVendor {
  typeIds: number[];
  typeNames: string;
  email: string;
  phone: string;
  cell: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  region: string;
  postalCode: string;
  contacts: ContactInfo[];
  reminders: ReminderInfo[];
  salesOrders: SaleOrderInfo[];
}
export interface VendorType {
  id: number;
  name: string;
}
