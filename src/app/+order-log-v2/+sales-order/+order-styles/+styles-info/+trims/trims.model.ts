import {
  TrimDetail
} from './+trims-detail';

export interface TrimOrder {
  activeTrim: TrimDetail;
  remainTrims: Array<{
    id: number;
    trimName: string;
    cTrimId: number;
    baseCTrimId: number;
    isUseForAllStyles: boolean;
  }>;
}
