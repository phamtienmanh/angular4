import {
  TaskStatus,
  Status
} from '../../shared/models';

export * from '../../shared/models/column-status.model';

const findStatusModelByIds = (ids: number[]) => {
  let model = [];
  ids.forEach((id) => {
    const status = Status.find((j) => j.id === id);
    if (status) {
      model.push(status);
    }
  });
  return model;
};

export const ColumnsType = [
  {
    id: 1,
    name: 'Credit Approval',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.ONHOLD,
        TaskStatus.COD,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: 2,
    name: 'OWS / Tech Pack Ready',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.BLANK,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 3,
    name: 'Order Documentation',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.CREATED,
        TaskStatus.RECEIVED
      ])
    ]
  },
  {
    id: 4,
    name: 'Trim ETA / Rcvd',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.TBD,
        TaskStatus.SCHEDULED,
        TaskStatus.RECEIVED,
        TaskStatus.PARTIALLYRECEIVED
      ])
    ]
  },
  {
    id: 5,
    name: 'Blank Goods ETA / Rcvd',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.BLANK,
        TaskStatus.TBD,
        TaskStatus.SCHEDULED,
        TaskStatus.RECEIVED,
        TaskStatus.PARTIALLYRECEIVED
      ])
    ]
  },
  {
    id: 6,
    name: 'Cut Ticket / Production PO Created',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.PENDINGAPPROVAL,
        TaskStatus.REJECTED,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: 7,
    name: 'Order Staged',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.PARTIAL,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 8,
    name: 'Art Released',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.BLANK,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 9,
    name: 'Print Approval',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.RERUN,
        TaskStatus.SCHEDULED,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: 10,
    name: 'Print Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.BLANK,
        TaskStatus.SCHEDULED,
        TaskStatus.PARTIAL,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 11,
    name: 'Neck Label Approval',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.RERUN,
        TaskStatus.SCHEDULED,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: 12,
    name: 'Neck Label Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.BLANK,
        TaskStatus.SCHEDULED,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 13,
    name: 'Specialty Treatment Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.BLANK,
        TaskStatus.SCHEDULED,
        TaskStatus.PARTIAL,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 14,
    name: 'Finishing Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.BLANK,
        TaskStatus.SCHEDULED,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 21,
    name: 'Shipping Labels',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 15,
    name: 'Pick & Pack Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.BLANK,
        TaskStatus.SCHEDULED,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 22,
    name: 'ETA @ TSC',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 16,
    name: 'QA',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING,
        TaskStatus.PASS,
        TaskStatus.FAIL
      ])
    ]
  },
  {
    id: 17,
    name: 'Ready to Ship Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.BLANK,
        TaskStatus.SCHEDULED,
        TaskStatus.PARTIAL,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 18,
    name: 'Actual Ship Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.BLANK,
        TaskStatus.SCHEDULED,
        TaskStatus.PARTIAL,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: 19,
    name: 'Shipping Documentation',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.COMPLETED,
        TaskStatus.RECEIVED
      ])
    ]
  },
  {
    id: 20,
    name: 'Invoiced',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.PARTIAL,
        TaskStatus.DONE
      ])
    ]
  }
];

export enum OrderLogType {
  All                        = 0,
  A2000ImportErrors          = 1,
  Unassigned                 = 2,
  Unpublished                = 3,
  Published                  = 4,
  A2000Revised               = 5,
  CreditPending              = 6,
  Unshipped                  = 7,
  PartialShipNoFolder        = 8,
  PartialShipFolder          = 9,
  ShippedNoFolder            = 10,
  ShippedFolder              = 11,
  Invoiced                   = 12,
  POsAssigned                = 13,
  CutTicketsAssigned         = 14,
  OutsourcedOrders           = 15,
  BlanksNotPurchased         = 16,
  BlanksPurchasedNotReceived = 17,
  TrimNotPurchased           = 18,
  TrimPurchasedNotReceived   = 19,
  PartialShip                = 20,
  LateShipments              = 21,
  LogisticsFolderPending     = 22,
  OWSTechPackPending         = 23,
  AccountingFolderPending    = 24,
  Shipped                    = 25,
  EDIPending                 = 26,
  // PartiallyScheduled         = 27,
  Schedulable                = 28,
  TrimNotReceived            = 29,
  Archived                   = 30,
  QaFailed                   = 31,
  Cancelled                  = 32,
  ReordersNotConfirmed       = 33,
  InvalidDaysInTransit       = 34,
  CutTicketsNeeded           = 35,
  CutTicketsApprNotStaged    = 36,
  Development                = 37
}

export const StyleColumns = {
  '8px': {
    csr: {
      width: 100,
      cellClass: 'columns-100'
    },
    creditApproval: {
      width: 50,
      cellClass: 'columns-50'
    },
    techPackReady: {
      width: 50,
      cellClass: 'columns-50'
    },
    orderDocumentation: {
      width: 60,
      cellClass: 'columns-60'
    },
    trimEta: {
      width: 70,
      cellClass: 'columns-70'
    },
    blankGoodsEta: {
      width: 70,
      cellClass: 'columns-70'
    },
    cutTicketCreated: {
      width: 70,
      cellClass: 'columns-70'
    },
    orderStaged: {
      width: 60,
      cellClass: 'columns-60'
    },
    styleInfo: {
      width: 80,
      cellClass: 'columns-80'
    },
    printLocation: {
      width: 70,
      cellClass: 'columns-70'
    },
    artReleased: {
      width: 70,
      cellClass: 'columns-70'
    },
    printApproval: {
      width: 70,
      cellClass: 'columns-70'
    },
    printTechSheetReady: {
      width: 50,
      cellClass: 'columns-50'
    },
    printDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    neckLabelApproval: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabelDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    specialtyTreatmentDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    finishingDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    shippingLabelsResponse: {
      width: 70,
      cellClass: 'columns-70'
    },
    pickAndPackDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    etaTscResponse: {
      width: 70,
      cellClass: 'columns-70'
    },
    qa: {
      width: 70,
      cellClass: 'columns-70'
    },
    readyToShipDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    actualToShipDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    shippingDocumentation: {
      width: 70,
      cellClass: 'columns-70'
    },
    invoiced: {
      width: 70,
      cellClass: 'columns-70'
    }
  },
  '9px': {
    csr: {
      width: 100,
      cellClass: 'columns-100'
    },
    creditApproval: {
      width: 60,
      cellClass: 'columns-60'
    },
    techPackReady: {
      width: 60,
      cellClass: 'columns-60'
    },
    orderDocumentation: {
      width: 70,
      cellClass: 'columns-70'
    },
    trimEta: {
      width: 80,
      cellClass: 'columns-80'
    },
    blankGoodsEta: {
      width: 80,
      cellClass: 'columns-80'
    },
    cutTicketCreated: {
      width: 70,
      cellClass: 'columns-70'
    },
    orderStaged: {
      width: 70,
      cellClass: 'columns-70'
    },
    styleInfo: {
      width: 80,
      cellClass: 'columns-80'
    },
    printLocation: {
      width: 70,
      cellClass: 'columns-70'
    },
    artReleased: {
      width: 70,
      cellClass: 'columns-70'
    },
    printApproval: {
      width: 70,
      cellClass: 'columns-70'
    },
    printTechSheetReady: {
      width: 50,
      cellClass: 'columns-50'
    },
    printDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    neckLabelApproval: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabelDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    specialtyTreatmentDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    finishingDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    shippingLabelsResponse: {
      width: 70,
      cellClass: 'columns-70'
    },
    pickAndPackDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    etaTscResponse: {
      width: 70,
      cellClass: 'columns-70'
    },
    qa: {
      width: 70,
      cellClass: 'columns-70'
    },
    readyToShipDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    actualToShipDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    shippingDocumentation: {
      width: 70,
      cellClass: 'columns-70'
    },
    invoiced: {
      width: 70,
      cellClass: 'columns-70'
    }
  },
  '10px': {
    csr: {
      width: 110,
      cellClass: 'columns-110'
    },
    creditApproval: {
      width: 60,
      cellClass: 'columns-60'
    },
    techPackReady: {
      width: 60,
      cellClass: 'columns-60'
    },
    orderDocumentation: {
      width: 80,
      cellClass: 'columns-80'
    },
    trimEta: {
      width: 90,
      cellClass: 'columns-90'
    },
    blankGoodsEta: {
      width: 90,
      cellClass: 'columns-90'
    },
    cutTicketCreated: {
      width: 80,
      cellClass: 'columns-80'
    },
    orderStaged: {
      width: 80,
      cellClass: 'columns-80'
    },
    styleInfo: {
      width: 90,
      cellClass: 'columns-90'
    },
    printLocation: {
      width: 80,
      cellClass: 'columns-80'
    },
    artReleased: {
      width: 80,
      cellClass: 'columns-80'
    },
    printApproval: {
      width: 80,
      cellClass: 'columns-80'
    },
    printTechSheetReady: {
      width: 60,
      cellClass: 'columns-60'
    },
    printDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabelApproval: {
      width: 90,
      cellClass: 'columns-90'
    },
    neckLabelDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    specialtyTreatmentDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    finishingDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    shippingLabelsResponse: {
      width: 80,
      cellClass: 'columns-80'
    },
    pickAndPackDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    etaTscResponse: {
      width: 80,
      cellClass: 'columns-80'
    },
    qa: {
      width: 80,
      cellClass: 'columns-80'
    },
    readyToShipDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    actualToShipDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    shippingDocumentation: {
      width: 80,
      cellClass: 'columns-80'
    },
    invoiced: {
      width: 80,
      cellClass: 'columns-80'
    }
  },
  '11px': {
    csr: {
      width: 120,
      cellClass: 'columns-120'
    },
    creditApproval: {
      width: 70,
      cellClass: 'columns-70'
    },
    techPackReady: {
      width: 70,
      cellClass: 'columns-70'
    },
    orderDocumentation: {
      width: 90,
      cellClass: 'columns-90'
    },
    trimEta: {
      width: 90,
      cellClass: 'columns-90'
    },
    blankGoodsEta: {
      width: 90,
      cellClass: 'columns-90'
    },
    cutTicketCreated: {
      width: 90,
      cellClass: 'columns-90'
    },
    orderStaged: {
      width: 90,
      cellClass: 'columns-90'
    },
    styleInfo: {
      width: 100,
      cellClass: 'columns-100'
    },
    printLocation: {
      width: 90,
      cellClass: 'columns-90'
    },
    artReleased: {
      width: 90,
      cellClass: 'columns-90'
    },
    printApproval: {
      width: 90,
      cellClass: 'columns-90'
    },
    printTechSheetReady: {
      width: 70,
      cellClass: 'columns-70'
    },
    printDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    neckLabelApproval: {
      width: 100,
      cellClass: 'columns-100'
    },
    neckLabelDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    specialtyTreatmentDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    finishingDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    shippingLabelsResponse: {
      width: 90,
      cellClass: 'columns-90'
    },
    pickAndPackDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    etaTscResponse: {
      width: 90,
      cellClass: 'columns-90'
    },
    qa: {
      width: 90,
      cellClass: 'columns-90'
    },
    readyToShipDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    actualToShipDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    shippingDocumentation: {
      width: 90,
      cellClass: 'columns-90'
    },
    invoiced: {
      width: 90,
      cellClass: 'columns-90'
    }
  },
  '12px': {
    csr: {
      width: 130,
      cellClass: 'columns-130'
    },
    creditApproval: {
      width: 80,
      cellClass: 'columns-80'
    },
    techPackReady: {
      width: 80,
      cellClass: 'columns-80'
    },
    orderDocumentation: {
      width: 100,
      cellClass: 'columns-100'
    },
    trimEta: {
      width: 100,
      cellClass: 'columns-100'
    },
    blankGoodsEta: {
      width: 100,
      cellClass: 'columns-100'
    },
    cutTicketCreated: {
      width: 100,
      cellClass: 'columns-100'
    },
    orderStaged: {
      width: 100,
      cellClass: 'columns-100'
    },
    styleInfo: {
      width: 110,
      cellClass: 'columns-110'
    },
    printLocation: {
      width: 90,
      cellClass: 'columns-90'
    },
    artReleased: {
      width: 100,
      cellClass: 'columns-100'
    },
    printApproval: {
      width: 100,
      cellClass: 'columns-100'
    },
    printTechSheetReady: {
      width: 70,
      cellClass: 'columns-70'
    },
    printDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    neckLabelApproval: {
      width: 110,
      cellClass: 'columns-110'
    },
    neckLabelDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    specialtyTreatmentDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    finishingDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    shippingLabelsResponse: {
      width: 100,
      cellClass: 'columns-100'
    },
    pickAndPackDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    etaTscResponse: {
      width: 100,
      cellClass: 'columns-100'
    },
    qa: {
      width: 100,
      cellClass: 'columns-100'
    },
    readyToShipDate: {
      width: 110,
      cellClass: 'columns-110'
    },
    actualToShipDate: {
      width: 110,
      cellClass: 'columns-110'
    },
    shippingDocumentation: {
      width: 100,
      cellClass: 'columns-100'
    },
    invoiced: {
      width: 100,
      cellClass: 'columns-100'
    }
  }
};
