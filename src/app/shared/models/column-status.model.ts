export enum TaskStatus {
  BLANK                    = 1,
  TBD                      = 2,
  SCHEDULED                = 3,
  RERUN                    = 4,
  PARTIAL                  = 5,
  APPROVED                 = 6,
  PARTIALLYRECEIVED        = 7,
  DONE                     = 8,
  COD                      = 9,
  PENDINGAPPROVAL          = 10,
  ONHOLD                   = 11,
  PENDING                  = 12,
  PASS                     = 13,
  FAIL                     = 14,
  REJECTED                 = 15,
  ONFILE                   = 16,
  CREATED                  = 17,
  RECEIVED                 = 18,
  COMPLETED                = 19,
  WAITINGINTERNAL          = 20,
  WAITINGCUSTOMER          = 21,
  APPROVEDWCHANGES         = 22,
  OK                       = 23,
  ISSUE                    = 24,
  SUBMITTED                = 25,
  REJECTEDRESUBMIT         = 26,
  DROPPED                  = 27,
  NOTAPPROVED              = 28,
  APPROVEDTOCORRECTPROCEED = 29,
  DELIVERYCONFIRM          = 30,
  APPROVEDANDDONE          = 31,
  APPROVEDANDHOLD          = 32,
  INPICKING                = 33,
  NONECKLABELSETUP         = 77,
  NECKLABELNOTREQUIRED     = 88,
  PENDING99                = 99,
  REORDER                  = 100,
  NOTAPPLICABLE            = 111,
  REORDERCONFIRM           = 996,
  NOTREQUIRED              = 997,
  NOTRECEIVED              = 998
}

export const Status = [
  {
    id: TaskStatus.BLANK,
    name: 'Not Applicable'
  },
  {
    id: TaskStatus.TBD,
    name: 'TBD'
  },
  {
    id: TaskStatus.ONHOLD,
    name: 'On Hold'
  },
  {
    id: TaskStatus.COD,
    name: 'COD'
  },
  {
    id: TaskStatus.RERUN,
    name: 'Rerun'
  },
  {
    id: TaskStatus.PENDING,
    name: 'Pending'
  },
  {
    id: TaskStatus.SCHEDULED,
    name: 'Scheduled'
  },
  {
    id: TaskStatus.CREATED,
    name: 'Created'
  },
  {
    id: TaskStatus.PARTIAL,
    name: 'Partial'
  },
  {
    id: TaskStatus.PENDINGAPPROVAL,
    name: 'Pending Approval'
  },
  {
    id: TaskStatus.REJECTED,
    name: 'Rejected'
  },
  {
    id: TaskStatus.REJECTEDRESUBMIT,
    name: 'Rejected Resubmit'
  },
  {
    id: TaskStatus.WAITINGINTERNAL,
    name: 'Waiting on Internal Approval'
  },
  {
    id: TaskStatus.WAITINGCUSTOMER,
    name: 'Waiting on Customer Approval'
  },
  {
    id: TaskStatus.APPROVEDWCHANGES,
    name: 'Approved w/ Changes'
  },
  {
    id: TaskStatus.APPROVED,
    name: 'Approved'
  },
  {
    id: TaskStatus.PARTIALLYRECEIVED,
    name: 'Partially Received'
  },
  {
    id: TaskStatus.RECEIVED,
    name: 'Received'
  },
  {
    id: TaskStatus.COMPLETED,
    name: 'Completed'
  },
  {
    id: TaskStatus.SUBMITTED,
    name: 'Submitted'
  },
  {
    id: TaskStatus.DONE,
    name: 'Done'
  },
  {
    id: TaskStatus.PASS,
    name: 'Pass'
  },
  {
    id: TaskStatus.FAIL,
    name: 'Fail'
  },
  {
    id: TaskStatus.DROPPED,
    name: 'Dropped'
  },
  {
    id: TaskStatus.ONFILE,
    name: 'On File'
  },
  {
    id: TaskStatus.PENDING99,
    name: 'Pending'
  },
  {
    id: TaskStatus.DELIVERYCONFIRM,
    name: 'Delivery Confirmed'
  },
  {
    id: TaskStatus.INPICKING,
    name: 'In Picking'
  },
  {
    id: TaskStatus.APPROVEDANDDONE,
    name: 'Approved & Done'
  },
  {
    id: TaskStatus.APPROVEDANDHOLD,
    name: 'Approved & Hold'
  },
  {
    id: TaskStatus.NONECKLABELSETUP,
    name: 'No Neck Label Setup'
  },
  {
    id: TaskStatus.NECKLABELNOTREQUIRED,
    name: 'Neck Label Not Required'
  },
  {
    id: TaskStatus.REORDER,
    name: 'Reorder'
  },
  {
    id: TaskStatus.NOTAPPLICABLE,
    name: 'Not Applicable'
  }
];

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

/* For Outsource, Import, Project grid */
export enum ColumnsTypeEnum {
  PoIssueDue                                  = 1,
  OwsTechPackReady                            = 2,
  ArtRequested                                = 3,
  ArtReceived                                 = 4,
  ArtReleased                                 = 5,
  TreatmentSampleDate                         = 6,
  TreatmentPhotoApprovalTsc                   = 7,
  EmbellishmentSampleDate                     = 8,
  PhotoApprovalTsc                            = 9,
  NeckPrintSampleDate                         = 10,
  NeckPrintPhotoApprovalTsc                   = 11,
  TrimSubmitsDue                              = 12,
  PhysSampleExFactoryDatePP                   = 13,
  PhysSampleExFactoryDatePPToTestingFacility  = 14,
  PhysSampleDeliveredtoTestingFacilityPP      = 15,
  PhysSampleApprovedByTestingFacilityPP       = 16,
  PhysSampleActualDateDeliveredPP             = 17,
  QCSampleShipDatePP                          = 18,
  FinalApprovalPP                             = 19,
  NeckLabelProduction                         = 20,
  EmbellishmentProduction                     = 21,
  WashProduction                              = 22,
  TOPDue                                      = 23,
  PhysSampleExFactoryDateTOP                  = 24,
  PhysSampleActualDateDeliveredTOP            = 25,
  QCSampleShipDateTOP                         = 26,
  ShippingLabelsTSCPackingList                = 27,
  FactoryPackingListCI                        = 28,
  XFactoryDate                                = 29,
  ReadyToShip3PL                              = 30,
  ETATSC                                      = 31,
  BlankGoodsEta                               = 32,
  ProductionDue                               = 33,
  SampleLeadTime                              = 34,
  ProductionLeadTime                          = 35,
  PoIssueDueOwsTechPackReady                  = 36,
  PhysSampleExFactoryDatePpAndTestingFacility = 37,
  PhysSampleDeliveredPp                       = 38,
  PhysSampleApprovedPp                        = 39,
  FactoryPackingListCiXFactoryDate            = 40,
  FabricQualityDue                            = 41,
  LabDipDue                                   = 42,
  FitSampleDue                                = 43,
  BulkFabric                                  = 44,
  StrikeOffKnitDownDue                        = 45,
  PPSampleDue                                 = 46,
  FinalApprovalTOP                            = 47,
  TechDesignReviewDatePP                      = 48,
  PackingValidationDue                        = 49,
  ActualShipDate                              = 50,
  ShippingDocumentation                       = 51,
  Invoiced                                    = 52,
  TscPresentationDate                         = 53,
  TscConceptBoardsForSelection                = 54,
  RetailerSelectionWoConceptApproval          = 55,
  ConceptApprovedByLicensor                   = 56,
  PackagingApprovedByLicensor                 = 57,
  Costing                                     = 58
}

export const ColumnsType = [
  {
    id: ColumnsTypeEnum.PoIssueDue,
    name: 'PO Issue Due',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDINGAPPROVAL,
        TaskStatus.REJECTED,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.OwsTechPackReady,
    name: 'OWS / Tech Pack Ready',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.BLANK,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.ArtRequested,
    name: 'Art Requested',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.BLANK,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.ArtReceived,
    name: 'Art Received',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.BLANK,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.ArtReleased,
    name: 'Art Released',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.BLANK,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.TreatmentSampleDate,
    name: 'Treatment Sample Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.WAITINGINTERNAL,
        TaskStatus.WAITINGCUSTOMER,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.TreatmentPhotoApprovalTsc,
    name: 'Treatment Photo Approval @ TSC',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.WAITINGINTERNAL,
        TaskStatus.WAITINGCUSTOMER,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.EmbellishmentSampleDate,
    name: 'Embellishment Sample Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.WAITINGINTERNAL,
        TaskStatus.WAITINGCUSTOMER,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.PhotoApprovalTsc,
    name: 'Photo Approval @ TSC',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.WAITINGINTERNAL,
        TaskStatus.WAITINGCUSTOMER,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.NeckPrintSampleDate,
    name: 'Neck Print Sample Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.WAITINGINTERNAL,
        TaskStatus.WAITINGCUSTOMER,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.NeckPrintPhotoApprovalTsc,
    name: 'Neck Print Photo Approval @ TSC',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.WAITINGINTERNAL,
        TaskStatus.WAITINGCUSTOMER,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.TrimSubmitsDue,
    name: 'Trim Submits Due',
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
    id: ColumnsTypeEnum.PhysSampleExFactoryDatePP,
    name: 'Phys. Sample Ex-Factory Date (PP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.PhysSampleExFactoryDatePPToTestingFacility,
    name: 'Phys. Sample Ex-Factory Date (PP To Testing Facility)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.PhysSampleDeliveredtoTestingFacilityPP,
    name: 'Phys. Sample Delivered to Testing Facility (PP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.PhysSampleActualDateDeliveredPP,
    name: 'Phys. Sample Actual Date Delivered (PP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.QCSampleShipDatePP,
    name: 'QC Sample / Ship Date (PP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.REJECTED,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.PhysSampleApprovedByTestingFacilityPP,
    name: 'Phys. Sample Approved By Testing Facility (PP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.FinalApprovalPP,
    name: 'Final Approval (PP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.REJECTED,
        TaskStatus.APPROVED,
        TaskStatus.APPROVEDWCHANGES,
        TaskStatus.DROPPED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.NeckLabelProduction,
    name: 'Neck Label Production',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.EmbellishmentProduction,
    name: 'Embellishment Production',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.WashProduction,
    name: 'Wash Production',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.TOPDue,
    name: 'TOP Due',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.PhysSampleExFactoryDateTOP,
    name: 'Phys. Sample Ex-Factory Date (TOP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.PhysSampleActualDateDeliveredTOP,
    name: 'Phys. Sample Actual Date Delivered (TOP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.QCSampleShipDateTOP,
    name: 'QC Sample / Ship Date (TOP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.REJECTED,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.ShippingLabelsTSCPackingList,
    name: 'Shipping Labels / TSC Packing List',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.FactoryPackingListCI,
    name: 'Factory Packing List / CI',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.XFactoryDate,
    name: 'x-Factory Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.Costing,
    name: 'Costing',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.PENDINGAPPROVAL,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.ReadyToShip3PL,
    name: 'Ready To Ship @ 3PL',
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
    id: ColumnsTypeEnum.ETATSC,
    name: 'ETA @ TSC',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.SCHEDULED,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.BlankGoodsEta,
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
    id: ColumnsTypeEnum.ProductionDue,
    name: 'Production Due',
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
    id: ColumnsTypeEnum.ActualShipDate,
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
    id: ColumnsTypeEnum.ShippingDocumentation,
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
    id: ColumnsTypeEnum.Invoiced,
    name: 'Invoiced',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.PARTIAL,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.FabricQualityDue,
    name: 'Fabric Quality Due',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.REJECTED,
        TaskStatus.APPROVED,
        TaskStatus.APPROVEDWCHANGES,
        TaskStatus.DROPPED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.LabDipDue,
    name: 'Lab Dips Due',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.REJECTED,
        TaskStatus.APPROVED,
        TaskStatus.APPROVEDWCHANGES,
        TaskStatus.DROPPED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.FitSampleDue,
    name: 'Fit Sample Due',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.REJECTED,
        TaskStatus.APPROVED,
        TaskStatus.APPROVEDWCHANGES,
        TaskStatus.DROPPED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.BulkFabric,
    name: 'Bulk Fabric',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.StrikeOffKnitDownDue,
    name: 'Strike Off / Knit Down Due',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.PPSampleDue,
    name: 'PP Sample Due',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.REJECTED,
        TaskStatus.APPROVED,
        TaskStatus.APPROVEDWCHANGES,
        TaskStatus.DROPPED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.TechDesignReviewDatePP,
    name: 'Tech Design Review Date (PP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.APPROVED,
        TaskStatus.APPROVEDWCHANGES,
        TaskStatus.REJECTED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.FinalApprovalTOP,
    name: 'Final Approval (TOP)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.REJECTED,
        TaskStatus.APPROVED,
        TaskStatus.APPROVEDWCHANGES,
        TaskStatus.DROPPED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.PackingValidationDue,
    name: 'Packing Validation Due',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.TscPresentationDate,
    name: 'Tsc Presentation Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.SUBMITTED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.TscConceptBoardsForSelection,
    name: 'Tsc Concept Boards for selection',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.REJECTED,
        TaskStatus.APPROVEDWCHANGES,
        TaskStatus.APPROVED,
        TaskStatus.DROPPED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.RetailerSelectionWoConceptApproval,
    name: 'Retailer Selection (w/o concept approval)',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.DONE
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.ConceptApprovedByLicensor,
    name: 'Concept Approved by Licensor',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.REJECTED,
        TaskStatus.APPROVEDWCHANGES,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: ColumnsTypeEnum.PackagingApprovedByLicensor,
    name: 'Packaging approved by Licensor',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING99,
        TaskStatus.REJECTED,
        TaskStatus.APPROVEDWCHANGES,
        TaskStatus.APPROVED,
        TaskStatus.DROPPED
      ])
    ]
  }
];
/* For Outsource, Import, Project grid */

export const TaskStatusLabel = [
  {
    id: TaskStatus.BLANK,
    name: 'N/A',
    className: 'stt-lightgrey'
  },
  {
    id: TaskStatus.TBD,
    name: 'TBD',
    className: 'stt-orange'
  },
  {
    id: TaskStatus.SCHEDULED,
    name: 'Scheduled',
    className: 'stt-yellow'
  },
  {
    id: TaskStatus.RERUN,
    name: 'Rerun',
    className: 'stt-green'
  },
  {
    id: TaskStatus.PARTIAL,
    name: 'Partial',
    className: 'stt-lightgreen'
  },
  {
    id: TaskStatus.APPROVED,
    name: 'Approved',
    className: 'stt-green'
  },
  {
    id: TaskStatus.APPROVEDWCHANGES,
    name: 'Appr w/ Chg',
    className: 'stt-green'
  },
  {
    id: TaskStatus.DONE,
    name: 'Done',
    className: 'stt-green'
  },
  {
    id: TaskStatus.COD,
    name: 'COD',
    className: 'stt-orange'
  },
  {
    id: TaskStatus.PENDINGAPPROVAL,
    name: 'Pending Aprvl',
    className: 'stt-yellow'
  },
  {
    id: TaskStatus.WAITINGCUSTOMER,
    name: 'Pending Aprvl',
    className: 'stt-yellow'
  },
  {
    id: TaskStatus.WAITINGINTERNAL,
    name: 'Pending Aprvl',
    className: 'stt-yellow'
  },
  {
    id: TaskStatus.ONHOLD,
    name: 'On Hold',
    className: 'stt-orange'
  },
  {
    id: TaskStatus.PENDING,
    name: 'Pending',
    className: 'stt-yellow'
  },
  {
    id: TaskStatus.PASS,
    name: 'Pass',
    className: 'stt-green'
  },
  {
    id: TaskStatus.FAIL,
    name: 'Fail',
    className: 'stt-red'
  },
  {
    id: TaskStatus.DROPPED,
    name: 'Dropped',
    className: 'stt-red'
  },
  {
    id: TaskStatus.REJECTED,
    name: 'Rejected',
    className: 'stt-red'
  },
  {
    id: TaskStatus.REJECTEDRESUBMIT,
    name: 'Rejected Resubmit',
    className: 'stt-red'
  },
  {
    id: TaskStatus.CREATED,
    name: 'Created',
    className: 'stt-orange'
  },
  {
    id: TaskStatus.RECEIVED,
    name: 'Received',
    className: 'stt-green'
  },
  {
    id: TaskStatus.PARTIALLYRECEIVED,
    name: 'Partial Rcvd',
    className: 'stt-light-green'
  },
  {
    id: TaskStatus.COMPLETED,
    name: 'Completed',
    className: 'stt-green'
  },
  {
    id: TaskStatus.SUBMITTED,
    name: 'Submitted',
    className: 'stt-green'
  },
  {
    id: TaskStatus.NOTREQUIRED,
    name: 'Not Required',
    className: 'stt-green'
  },
  {
    id: TaskStatus.NOTAPPLICABLE,
    name: 'Not Applicable',
    className: 'stt-green'
  },
  {
    id: TaskStatus.REORDER,
    name: 'Reorder',
    className: 'stt-green'
  },
  {
    id: TaskStatus.REORDERCONFIRM,
    name: 'Reorder Conf',
    className: 'stt-green'
  },
  {
    id: TaskStatus.NOTRECEIVED,
    name: 'Not Received',
    className: 'stt-red'
  },
  {
    id: TaskStatus.NOTAPPROVED,
    name: 'Not Approved',
    className: 'stt-red'
  },
  {
    id: TaskStatus.ISSUE,
    name: 'Issue',
    className: 'stt-orange'
  },
  {
    id: TaskStatus.OK,
    name: 'OK',
    className: 'stt-green'
  },
  {
    id: TaskStatus.DELIVERYCONFIRM,
    name: 'Confirmed',
    className: 'stt-green'
  },
  {
    id: TaskStatus.INPICKING,
    name: 'In Picking',
    className: 'stt-orange'
  },
  {
    id: TaskStatus.APPROVEDANDDONE,
    name: 'Appr / Done',
    className: 'stt-green'
  },
  {
    id: TaskStatus.APPROVEDANDHOLD,
    name: 'Appr / Hold',
    className: 'stt-orange'
  }
];

export const CommonTopPpListStatus =
  findStatusModelByIds([
    TaskStatus.PENDING,
    TaskStatus.DONE
  ]);

export const TopPpColumnsTypes = [
  {
    id: 1,
    name: 'Sample Approval Type',
    listStatus: []
  },
  {
    id: 2,
    name: 'Neck Label',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.NONECKLABELSETUP,
        TaskStatus.NECKLABELNOTREQUIRED,
        TaskStatus.PENDING,
        TaskStatus.REORDER,
        TaskStatus.SCHEDULED,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: 3,
    name: 'Art Requested',
    listStatus: CommonTopPpListStatus
  },
  {
    id: 4,
    name: 'Art Received',
    listStatus: CommonTopPpListStatus
  },
  {
    id: 5,
    name: 'Neck Label Art Received',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.ONFILE
      ]),
      ...CommonTopPpListStatus]
  },
  {
    id: 6,
    name: 'Separation Complete',
    listStatus: CommonTopPpListStatus
  },
  {
    id: 7,
    name: 'Blanks Received',
    listStatus: CommonTopPpListStatus
  },
  {
    id: 8,
    name: 'Sample Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING,
        TaskStatus.SCHEDULED
      ])
    ]
  },
  {
    id: 9,
    name: 'QC Date',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.NOTAPPLICABLE
      ]),
      ...CommonTopPpListStatus
    ]
  },
  {
    id: 10,
    name: 'Art Released',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.NOTAPPLICABLE
      ]),
      ...CommonTopPpListStatus
    ]
  },
  {
    id: 11,
    name: 'Approved to Sample',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING,
        TaskStatus.APPROVED
      ])
    ]
  },
  {
    id: 12,
    name: 'Print Approval',
    listStatus: [
      ...findStatusModelByIds([
        TaskStatus.PENDING,
        TaskStatus.APPROVED
      ])
    ]
  }
];
