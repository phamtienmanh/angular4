export interface ProjectInfoModel {
  id?: number;
  name: string;
  customerId: number;
  customerName: number;
  regionIds: number[];
  tscPresentationDateOnUtc: string;
  startDateOnUtc: string;
  inDcStoreDateOnUtc: string;
  comments: string;
}

export interface ProjectInfoResponse {
  data: ProjectInfoModel[];
  totalRecord: number;
}
