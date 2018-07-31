export interface LookupData {
  type: string;
  id: number;
  name: string;
  description: string;
  isDisabled: boolean;
}

export interface LookupDataResponse {
  data: LookupData[];
  totalRecord: number;
}

export const TableType = {
  approvalType: 'C_ApprovalType',
  color: 'C_Color',
  content: 'C_Content',
  countryOfOrigin: 'C_Coo',
  cut: 'C_Cut',
  design: 'C_Design',
  dropShip: 'C_DropShip',
  printLocation: 'C_Location',
  orderType: 'C_OrderType',
  printMachine: 'C_PrintMachine',
  separationType: 'C_SeparationType',
  embellishmentType: 'C_EmbellishmentType',
  shipFrom: 'C_ShipFrom',
  shipVia: 'C_ShipVia',
  special: 'C_Special',
  style: 'C_Style',
  treatment: 'C_Treatment',
  trim: 'C_Trim',
  licensors: 'C_Licensor',
  licensees: 'C_Licensee',
  retailer: 'C_Retailer'
};
