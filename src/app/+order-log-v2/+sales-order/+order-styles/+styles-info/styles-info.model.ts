export enum DesignType {
  Blanks        = 0,
  Trims         = 1,
  PrintLocation = 2,
  Notes         = 3,
  Schedule      = 4,
  Samples       = 5
}

export interface SalesDesignInfo {
  id: number;
  name: string;
}

export interface StyleSize {
  blankId: number;
  id: number;
  qty: number;
  name: string;
}
