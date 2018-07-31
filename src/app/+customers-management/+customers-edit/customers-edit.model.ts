import {
  ReminderInfo
} from '../+customers-detail/edit-reminder';
import {
  SaleOrderInfo
} from '../+customers-detail/customer-sales-order';
export interface ContactInfo {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fax: string;
}
export interface BasicCustomer {
  id: number;
  company: string;
}
export interface CustomerInfo extends BasicCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fax: string;
  type: number;
  contacts: ContactInfo[];
  reminders: ReminderInfo[];
  salesOrders: SaleOrderInfo[];
}
