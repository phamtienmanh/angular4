export interface ProjectUsersModel {
  id?: number;
  projectManagers: any[];
  projectEditors: any[];
  projectViewers: any[];
}

export interface ProjectUsersResponse {
  data: ProjectUsersModel[];
  totalRecord: number;
}
