export interface BasicCsrInfo {
  id: number;
  fullName: string;
  isActive: boolean;
  isLoggedinUser: boolean;
  isAssigned?: boolean;
  isPrimaryAccountManager?: boolean;
}

export interface BasicCustomerInfo {
  id: number;
  name: string;
}

export interface BasicVendorInfo {
  id: number;
  name: string;
  isMachine: boolean;
  type: string;
}

export interface BasicGeneralInfo {
  id: number;
  name: string;
  description: string;
}

export const SizeColumns = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2X',
  '3X',
  '4X'
];

interface FileReaderEventTarget extends EventTarget {
  result: any;
  files: any;
}

export interface FileReaderEvent extends Event {
  target: FileReaderEventTarget;
  getMessage(): string;
}

export interface UploadedImage {
  relativeUrl: string;
  absoluteUrl: string;
}
