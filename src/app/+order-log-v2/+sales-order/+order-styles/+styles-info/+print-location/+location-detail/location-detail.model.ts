export interface PrintLocationInfo {
  id?: number;
  orderDetailId?: number;
  designId: number;
  designName: string;
  locationId: number;
  locationName: string;
  approvalProcessId: number;
  approvalProcessName: string;
  treatmentId: number;
  treatmentName: string;
  printMethodId: number;
  printMethodName: string;
  specialId: number;
  specialName: string;
  printMachineId: number;
  printMachineName: string;
  placement: string;
  widthHeight: string;
  imageUrl: string;
  absoluteUrl: string;
  rerunStatus: boolean;
  sendToVendorStatus: boolean;
  artReceivedStatus: boolean;
  artApprovedStatus: boolean;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  color6: string;
  color7: string;
  color8: string;
  color9: string;
  color10: string;
  color11: string;
  color12: string;
  color13: string;
  color14: string;
}

export enum PmsType {
  Pre = 0,
  Sample = 1,
  Approved = 2
}

export interface Film {
  colorId: number;
  pmsId: number;
  pmsName: string;
  mesh: string;
  type: number;
  printType: number;
}
