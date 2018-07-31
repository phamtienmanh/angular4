export interface ReminderInfo {
  id?: number;
  type?: number;
  content: string;
  remindDateOnUtc: Date | any;
  userId: number;
  userName: string | any;
  fullName?: string;
}
