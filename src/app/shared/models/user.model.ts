import { PagePermission } from '../../+role-management/role-management.model';

export interface BasicUserInfo {
  id: number;
  username: string;
  fullName: string;
}

export interface UserInfo extends BasicUserInfo {
  allowedCustomerIds: number[];
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  badgeId: string;
  customerServiceReps: any[];
  customerServiceTeams: string[];
  avatarUrl: string;
  listRoleIds: number[];
  listRole: any[];
  role?: string;
  permissions: PagePermission[];
  password: string;
  confirmPassword: string;
  reminders: Reminder[];
  refreshOrderLogPageTime: number;
  orderLogColumnConfig: PagePermission[];
  schedulesColumnConfigs: any[];
  orderLogImportColumnConfig: PagePermission[];
  orderLogOutsourceColumnConfig: PagePermission[];
  orderLogSampleDevelopmentUserConfigs: PagePermission[];
  projectProductPrimaryConfigs: PagePermission[];
  projectProductSecondaryConfigs: PagePermission[];
  csrAndAmUsers: any[];
  isSentInvitation: boolean;
  isChangedDefaultPassword?: boolean;
  isPrimaryAccountManager?: boolean;
  isAccountManager?: boolean;
  A2000ManualSync?: boolean;
  automaticallyLogOff: number;
  reports: any[];
}

export class UserInfo implements UserInfo {
  constructor() {
    this.id = undefined;
    this.username = undefined;
    this.email = undefined;
    this.firstName = undefined;
    this.lastName = undefined;
    this.phoneNumber = undefined;
    this.avatarUrl = undefined;
    this.password = undefined;
    this.confirmPassword = undefined;
    this.permissions = [];
  }
}

export interface UserToken {
  accessToken: string;
  refreshToken: string;
}

export interface Roles {
  id: number;
  name: string;
  status?: boolean;
}

export interface FullAuthentication {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  client_id: string;
  username: string;
  userId: number;
  expires: string;
  error: string;
  error_description: string;
}

export interface UserListResponse {
  data: UserInfo[];
  totalRecord: number;
}

export interface DeleteUserModel {
  isCheckedAll: boolean;
  itemsRemoved: string;
  itemsChecked: string;
  keyword: string;
}

export interface Reminder {
  assignToUserId: number;
  avatarUrl: string;
  content: string;
  customerId: number;
  fullName: string;
  id: number;
  remindDateOnUtc: string;
  userId: number;
  createdOnUtc: string;
}
