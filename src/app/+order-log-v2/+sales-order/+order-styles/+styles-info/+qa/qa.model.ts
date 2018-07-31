export interface QaModel {
  id?: number;
  auditor: string[];
  auditDateOnUtc: string;
  auditType: number;
  files: any[];
}
