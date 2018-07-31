import { BasicGeneralInfo } from '../shared/models';

export interface FactoryBasicInfo {
  id: number;
  name: string;
  country: string;
  types: BasicGeneralInfo[];
  type: number;
  active: boolean;
}

export interface Factory extends FactoryBasicInfo {
  poIssueDueMin: number;
  poIssueDueMax: number;
  owsTechPackReadyMin: number;
  owsTechPackReadyMax: number;
}

export interface FactoryListResponse {
  data: Factory[];
  totalRecord: number;
}

export enum  ItemTypes {
  DOMESTIC  = 1,
  OUTSOURCE = 2,
  IMPORTS   = 3
}

export const ItemTypeList = [
  {
    id: ItemTypes.DOMESTIC,
    name: 'DOMESTIC'
  },
  {
    id: ItemTypes.OUTSOURCE,
    name: 'OUTSOURCE'
  },
  {
    id: ItemTypes.IMPORTS,
    name: 'IMPORTS'
  }
];
