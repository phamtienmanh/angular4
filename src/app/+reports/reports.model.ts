export interface ReportScheduler {
  recurValue: number;
  recurType: number;
  sendType: number;
  sendTypeValue: string;
  startedDateOnUtc: Date;
  endedDateOnUtc: Date;
  isActivedSendTypeValue: boolean;
  timeZone: string;
  lastSentOnUtc: Date;
}

export interface ReportsInfo {
  id: number;
  name: string;
  title: number;
  emails: string;
  emailSubject: string;
  emailDisplay?: string;
  active: boolean;
  users: string;
  roles: string;
  reportScheduler: ReportScheduler;
}

export interface ReportsResponse {
  data: ReportsInfo[];
  totalRecord: number;
}

export const RecurTypes = [
  {
    id: 1,
    name: 'Minutes'
  },
  {
    id: 2,
    name: 'Hours'
  },
  {
    id: 3,
    name: 'Days'
  },
  {
    id: 4,
    name: 'Weeks'
  },
  {
    id: 5,
    name: 'Months'
  }
];

export const SendTypes = [
  {
    id: 1,
    name: 'Days'
  },
  {
    id: 2,
    name: 'Week Days'
  }
];

export const Days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                     11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                     21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

export const WeekDays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const Times = [
  { value: '00:00', label: '12:00 AM' },
  { value: '00:30', label: '12:30 AM' },
  { value: '01:00', label: '01:00 AM' },
  { value: '01:30', label: '01:30 AM' },
  { value: '02:00', label: '02:00 AM' },
  { value: '02:30', label: '02:30 AM' },
  { value: '03:00', label: '03:00 AM' },
  { value: '03:30', label: '03:30 AM' },
  { value: '04:00', label: '04:00 AM' },
  { value: '04:30', label: '04:30 AM' },
  { value: '05:00', label: '05:00 AM' },
  { value: '05:30', label: '05:30 AM' },
  { value: '06:00', label: '06:00 AM' },
  { value: '06:30', label: '06:30 AM' },
  { value: '07:00', label: '07:00 AM' },
  { value: '07:30', label: '07:30 AM' },
  { value: '08:00', label: '08:00 AM' },
  { value: '08:30', label: '08:30 AM' },
  { value: '09:00', label: '09:00 AM' },
  { value: '09:30', label: '09:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '13:30', label: '01:30 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '14:30', label: '02:30 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '15:30', label: '03:30 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '16:30', label: '04:30 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '17:30', label: '05:30 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '18:30', label: '06:30 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '19:30', label: '07:30 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '20:30', label: '08:30 PM' },
  { value: '21:00', label: '09:00 PM' },
  { value: '21:30', label: '09:30 PM' },
  { value: '22:00', label: '10:00 PM' },
  { value: '22:30', label: '10:30 PM' },
  { value: '23:00', label: '11:00 PM' },
  { value: '23:30', label: '11:30 PM' }
];

export const RecurValues = [
  '',
  'Minutes',
  'Hours',
  'Days',
  'Weeks',
  'Months'
];
