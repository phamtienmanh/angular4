import {
  StyleSize
} from '../styles-info.model';

export enum StyleUploadedType {
  ProductionPO       = 0,
  BlankSubmission    = 1,
  QA                 = 2,
  OrderWorkSheets    = 3,
  TechPacks          = 4,
  ShippingLabels     = 5,
  TscPackingList     = 6,
  FactoryPackingList = 7,
  CommercialInvoice  = 8
}

export enum StyleType {
  Style        = 0,
  PartnerStyle = 1,
  Vendor       = 2,
  A2000Style   = 3,
}

export enum EmbellishmentProcess {
  Treatment  = 1,
  Print      = 2,
  Embroidery = 3,
  Patch      = 4
}

export enum OveragesMethod {
  None        = 0,
  Percentage  = 1,
  Quantity    = 2,
}

export interface StyleDetail {
  id: number;
  customerPoId: string;
  itemType: number;
  orderId: string;
  styleId: string;
  styleName: string;
  partnerStyleId: number;
  partnerStyleName: string;
  designId: number;
  vendorId: number;
  vendorName: string;
  a2000StyleId: number;
  a2000StyleName: string;
  vendorStyleId: number;
  vendorStyleName: string;
  sizeClassId: number;
  sizeClassName: string;
  cutId: number;
  cutName: string;
  colorId: number;
  colorName: string;
  contentId: number;
  contentName: string;
  cooId: number;
  cooName: string;
  sizeSelected: string[];
  topAdjustment: number;
  estDeliveryDateFromOnUtc: Date;
  estDeliveryDateToOnUtc: Date;
  receivedDateFromOnUtc: Date;
  receivedDateToOnUtc: Date;
  status: string;
  saleOrderSizes: StyleSize[];
  productionSizes: StyleSize[];
  sampleSizes: StyleSize[];
  topSizes: StyleSize[];
  sizeColumns?: any[];
  files?: any[];
  cutTicketFiles?: any[];
  blanks: Blank[];
  overagesMethod: number;
  overages: number;
  noTrimRequired: boolean;
  isCancelled: boolean;
  isA2000Order: boolean;
  isConfirmReorder: boolean;
  styleType: number;
  isReorder: boolean;
  isReorderConfirmed: string;
  techPackReadyDateOnUtc: Date;
  techPackApplyToStyles: number[];
}

export interface Blank {
  id: number;
  styleId: number;
  vendorId: number;
  vendorName: string;
  comments: string;
  poNumber: string;
  estDeliveryDateFromOnUtc: Date;
  estDeliveryDateToOnUtc: Date;
  receivedDateFromOnUtc: Date;
  receivedDateToOnUtc: Date;
  files?: any[];
  applyToStyles: string;
}

export enum FactoryTypes {
  All       = 0,
  Domestic  = 1,
  Outsource = 2,
  Imports   = 3,
}

export const ItemTypes = [
  {
    id: 1,
    name: 'Domestic'
  },
  {
    id: 2,
    name: 'Outsource'
  },
  {
    id: 3,
    name: 'Imports'
  }
];

export const ProductionMethods = [
  {
    id: 1,
    name: 'Full Package'
  },
  {
    id: 2,
    name: 'Custom Cut & Sew Blank'
  }
];

export const ShipMethods = [
  {
    id: 1,
    name: 'Ocean'
  },
  {
    id: 2,
    name: 'Air'
  },
  {
    id: 3,
    name: 'Truck'
  },
  {
    id: 4,
    name: 'FedEx'
  }
];

export const BlankSizes = [
  {
    id: 0,
    name: 'Sales Order Qty',
    sizeName: 'saleOrderSizes',
    canEdit: true
  },
  {
    id: 1,
    name: 'TOP Sample Qty',
    sizeName: 'topSizes',
    canEdit: false
  },
  {
    id: 2,
    name: 'Licensor',
    sizeName: 'licensorSizes',
    canEdit: true,
    isChildSize: true
  },
  {
    id: 3,
    name: 'Licensee',
    sizeName: 'licenseeSizes',
    canEdit: true,
    isChildSize: true
  },
  {
    id: 4,
    name: 'Retailer',
    sizeName: 'retailerSizes',
    canEdit: true,
    isChildSize: true
  },
  {
    id: 5,
    name: 'Sales',
    sizeName: 'salesSizes',
    canEdit: true,
    isChildSize: true
  },
  {
    id: 6,
    name: 'Total Order Qty',
    sizeName: 'totalOrderSizes',
    canEdit: false
  },
  {
    id: 7,
    name: 'Overage Qty',
    sizeName: 'overageSizes',
    canEdit: false
  },
  {
    id: 8,
    name: 'WHS Blank Qty',
    sizeName: 'whsBlankSizes',
    canEdit: true
  },
  {
    id: 9,
    name: 'WHS Printed Qty',
    sizeName: 'whsPrintedSizes',
    canEdit: true
  },
  {
    id: 10,
    name: 'Purchase Qty',
    sizeName: 'purchaseSizes',
    canEdit: false
  },
  {
    id: 11,
    name: 'Total Production Qty',
    sizeName: 'totalProductionSizes',
    canEdit: false
  },
  {
    id: 12,
    name: 'Total Finished Qty',
    sizeName: 'totalFinishedSizes',
    canEdit: false
  }
];
