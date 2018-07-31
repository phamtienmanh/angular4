export interface HistoryInfo {
  id: number;
  orderId: number;
  fullName: string;
  activityDescription: string;
  additionalDetail: string;
  createdOnUtc: Date;
}

export interface HistoryResponse {
  data: HistoryInfo[];
  totalRecord: number;
}
