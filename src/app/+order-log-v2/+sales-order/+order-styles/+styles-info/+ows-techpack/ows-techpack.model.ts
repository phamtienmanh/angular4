import {
  Status,
  TaskStatus
} from '../../../../../shared/models/column-status.model';

export enum TechPackFileTypes {
  FabricQualityDetail  = 1,
  LabDipDetail         = 2,
  FitSampleDetail      = 3,
  PpSample             = 4,
  PackingValidate      = 5
}

export const ApprovalStatusList = Status.filter((stt) => [
  'Approved',
  'Approved w/ Changes',
  'Rejected',
  'Dropped'
].indexOf(stt.name) > -1);
