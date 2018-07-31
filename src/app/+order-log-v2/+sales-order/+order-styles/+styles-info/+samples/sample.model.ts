export interface SampleDetail {
  id?: number;
  itemType: number;
  isSampleToMatch: boolean;
  approvalTypeNames: string[];
  customerSampleQty: string;
  sampleDueDateOnUtc: Date;
  bin: string;
  blanksDeliveredToArtDeptOnUtc: Date;
  blanksReceivedIntoArtDeptOnUtc: Date;
  artRequestedOnUtc: Date;
  sampleDateOnUtc: Date;
  printLocations: PrintLocation[];
  samplePrinter: SamplePrinter[];
  qcSampleQty: string;
  qcSampleDate: string;
  qcSampleDateOnUtc: Date;
  comment: string;
  artReceivedDateFromOnUtc: Date;
  artReceivedDateToOnUtc: Date;
  artApprovedDateFromOnUtc: Date;
  artApprovedDateToOnUtc: Date;
  artReleasedDateFromOnUtc: Date;
  artReleasedDateToOnUtc: Date;
  sampleDateFromOnUtc: Date;
  sampleDateToOnUtc: Date;
  customerSampleSizes: SampleSize[];
  styleImageUrl: string;
  customerPoId: string;
}
export interface Color {
  colorId: number;
  pmsId: number;
  pmsName: string;
  sequence: string;
  mesh: string;
  type: number;
}
export interface PrintLocation {
  printLocationId?: number;
  locationId: number;
  locationName: string;
  isPrintApproved: boolean;
  absoluteUrl: string;
  relativeUrl: string;
  pmsColors: Color[];
}
export interface JobChange {
  id?: number;
  createdOnUtc: Date;
  changeJobId: string;
  changeJobName: string;
  printLocationId: number;
  locationName: string;
  comment: string;
  processTime: number;
  timeConvert?: string;
}
export interface SamplePrinter  {
  id: 0;
  name: string;
  samplePrinterType: number;
}

export interface SampleSize {
  size: string;
  qty: number;
  type: string;
}
