import { BasicUserInfo } from '../shared/models/user.model';

export enum AccessControlType {
  Pages     = 1,
  OrderLog  = 2,
  Functions = 3,
  SchedulesPrint = 4,
  SchedulesNeckLabel = 5,
  SchedulesFinishing = 6,
  SchedulesPendingSamples = 7,
  SchedulesSamples = 8,
  SchedulesOutsourcePrint = 9,
  SchedulesOutsourceFinishing = 10,
  Outsource = 11,
  SampleDevelopment = 12,
  Projects = 13,
  Imports = 14,
  SchedulesTopPpSamples = 16
}

export interface PagePermission {
  id: number;
  name: string;
  description: string;
  isView: boolean;
  isModify: boolean;
  type: number;
}

export interface RoleInfo {
  id?: number;
  roleName: string;
  normalizeName: string;
  description: string;
  isActive: boolean;
  userIds: number[];
  users: BasicUserInfo[];
  permissions: PagePermission[];
}

export interface RoleListResponse {
  data: RoleInfo[];
  totalRecord: number;
}
