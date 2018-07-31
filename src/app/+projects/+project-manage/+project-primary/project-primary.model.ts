export * from '../../../shared/models/column-status.model';
export * from '../../../shared/models/upload-type.model';

export enum ProductType {
  Priority  = 1,
  Secondary = 2
}

export enum ColumnType {
  Description                = 1,
  Visual                     = 2,
  Csr                        = 3,
  StyleName                  = 4,
  Comments                   = 5,
  Costing                    = 6,
  Regions                    = 7,
  TscPresentationDate        = 8,
  TscConceptBoards           = 9,
  LicensorSelection          = 10,
  ConceptApproved            = 11,
  PackagingApproved          = 12,
  PhysSampleExFactoryDate    = 13,
  PpToTestingFacility        = 14,
  PhysSampleDelivered        = 15,
  PhysSampleApproved         = 16,
  PhysSampleActualDate       = 17,
  TechDesignReviewDate       = 18,
  QcSampleShipDate           = 19,
  SamplesDeliveredToCustomer = 20,
  FinalApproval              = 21,
  BulkUpload                 = 22,
  CustomerPoReceiveDate      = 23,
  ProductionDue              = 24,
  XFactoryDate               = 25,
  Arrival3Pl                 = 26,
  ReadyToShip3pl             = 27,
  InDcStoreDate              = 28
}

export const StyleColumns = {
  '8px': {
    description: {
      width: 60
    },
    visualImage: {
      width: 80
    },
    csr: {
      width: 90
    },
    factory: {
      width: 60
    },
    styleInfo: {
      width: 90
    },
    comments: {
      width: 70
    },
    costing: {
      width: 70
    },
    regions: {
      width: 60
    },
    tscPresentationDate: {
      width: 70
    },
    tscConceptBoards: {
      width: 70
    },
    licensorSelection: {
      width: 70
    },
    conceptApproved: {
      width: 70
    },
    packagingApproved: {
      width: 70
    },
    physSampleExFactoryDatePp: {
      width: 70
    },
    physSampleExFactoryDatePpToTestingFacility: {
      width: 80
    },
    physSampleDeliveredToTestingFacilityPp: {
      width: 70
    },
    physSampleApprovedByTestingFacilityPp: {
      width: 70
    },
    physSampleActualDateDeliveredPp: {
      width: 70
    },
    techDesignReviewDatePp: {
      width: 70
    },
    qcSampleShipDate: {
      width: 70
    },
    samplesDeliveredToCustomer: {
      width: 70
    },
    finalApproval: {
      width: 70
    },
    bulkUpload: {
      width: 70
    },
    customerPoReceiveDate: {
      width: 70
    },
    productionDue: {
      width: 70
    },
    xFactoryDate: {
      width: 70
    },
    arrival3Pl: {
      width: 70
    },
    readyToShip3Pl: {
      width: 70
    },
    inDcStoreDate: {
      width: 70
    }
  },
  '9px': {
    description: {
      width: 60
    },
    visualImage: {
      width: 80
    },
    csr: {
      width: 90
    },
    factory: {
      width: 60
    },
    styleInfo: {
      width: 90
    },
    comments: {
      width: 70
    },
    costing: {
      width: 70
    },
    regions: {
      width: 60
    },
    tscPresentationDate: {
      width: 70
    },
    tscConceptBoards: {
      width: 70
    },
    licensorSelection: {
      width: 70
    },
    conceptApproved: {
      width: 70
    },
    packagingApproved: {
      width: 70
    },
    physSampleExFactoryDatePp: {
      width: 70
    },
    physSampleExFactoryDatePpToTestingFacility: {
      width: 80
    },
    physSampleDeliveredToTestingFacilityPp: {
      width: 70
    },
    physSampleApprovedByTestingFacilityPp: {
      width: 70
    },
    physSampleActualDateDeliveredPp: {
      width: 70
    },
    techDesignReviewDatePp: {
      width: 70
    },
    qcSampleShipDate: {
      width: 70
    },
    samplesDeliveredToCustomer: {
      width: 70
    },
    finalApproval: {
      width: 70
    },
    bulkUpload: {
      width: 70
    },
    customerPoReceiveDate: {
      width: 70
    },
    productionDue: {
      width: 70
    },
    xFactoryDate: {
      width: 70
    },
    arrival3Pl: {
      width: 70
    },
    readyToShip3Pl: {
      width: 70
    },
    inDcStoreDate: {
      width: 70
    }
  },
  '10px': {
    description: {
      width: 70
    },
    visualImage: {
      width: 80
    },
    csr: {
      width: 100
    },
    factory: {
      width: 70
    },
    styleInfo: {
      width: 100
    },
    comments: {
      width: 80
    },
    costing: {
      width: 80
    },
    regions: {
      width: 70
    },
    tscPresentationDate: {
      width: 80
    },
    tscConceptBoards: {
      width: 80
    },
    licensorSelection: {
      width: 80
    },
    conceptApproved: {
      width: 80
    },
    packagingApproved: {
      width: 80
    },
    physSampleExFactoryDatePp: {
      width: 80
    },
    physSampleExFactoryDatePpToTestingFacility: {
      width: 90
    },
    physSampleDeliveredToTestingFacilityPp: {
      width: 80
    },
    physSampleApprovedByTestingFacilityPp: {
      width: 80
    },
    physSampleActualDateDeliveredPp: {
      width: 80
    },
    techDesignReviewDatePp: {
      width: 80
    },
    qcSampleShipDate: {
      width: 80
    },
    samplesDeliveredToCustomer: {
      width: 80
    },
    finalApproval: {
      width: 80
    },
    bulkUpload: {
      width: 80
    },
    customerPoReceiveDate: {
      width: 80
    },
    productionDue: {
      width: 80
    },
    xFactoryDate: {
      width: 80
    },
    arrival3Pl: {
      width: 80
    },
    readyToShip3Pl: {
      width: 80
    },
    inDcStoreDate: {
      width: 80
    }
  },
  '11px': {
    description: {
      width: 80
    },
    visualImage: {
      width: 80
    },
    csr: {
      width: 110
    },
    factory: {
      width: 80
    },
    styleInfo: {
      width: 110
    },
    comments: {
      width: 90
    },
    costing: {
      width: 90
    },
    regions: {
      width: 70
    },
    tscPresentationDate: {
      width: 90
    },
    tscConceptBoards: {
      width: 90
    },
    licensorSelection: {
      width: 90
    },
    conceptApproved: {
      width: 90
    },
    packagingApproved: {
      width: 90
    },
    physSampleExFactoryDatePp: {
      width: 90
    },
    physSampleExFactoryDatePpToTestingFacility: {
      width: 100
    },
    physSampleDeliveredToTestingFacilityPp: {
      width: 90
    },
    physSampleApprovedByTestingFacilityPp: {
      width: 90
    },
    physSampleActualDateDeliveredPp: {
      width: 90
    },
    techDesignReviewDatePp: {
      width: 90
    },
    qcSampleShipDate: {
      width: 90
    },
    samplesDeliveredToCustomer: {
      width: 90
    },
    finalApproval: {
      width: 90
    },
    bulkUpload: {
      width: 90
    },
    customerPoReceiveDate: {
      width: 90
    },
    productionDue: {
      width: 90
    },
    xFactoryDate: {
      width: 90
    },
    arrival3Pl: {
      width: 90
    },
    readyToShip3Pl: {
      width: 90
    },
    inDcStoreDate: {
      width: 90
    }
  },
  '12px': {
    description: {
      width: 90
    },
    visualImage: {
      width: 80
    },
    csr: {
      width: 120
    },
    factory: {
      width: 90
    },
    styleInfo: {
      width: 120
    },
    comments: {
      width: 100
    },
    costing: {
      width: 100
    },
    regions: {
      width: 80
    },
    tscPresentationDate: {
      width: 100
    },
    tscConceptBoards: {
      width: 100
    },
    licensorSelection: {
      width: 100
    },
    conceptApproved: {
      width: 100
    },
    packagingApproved: {
      width: 100
    },
    physSampleExFactoryDatePp: {
      width: 100
    },
    physSampleExFactoryDatePpToTestingFacility: {
      width: 110
    },
    physSampleDeliveredToTestingFacilityPp: {
      width: 100
    },
    physSampleApprovedByTestingFacilityPp: {
      width: 100
    },
    physSampleActualDateDeliveredPp: {
      width: 100
    },
    techDesignReviewDatePp: {
      width: 100
    },
    qcSampleShipDate: {
      width: 100
    },
    samplesDeliveredToCustomer: {
      width: 100
    },
    finalApproval: {
      width: 100
    },
    bulkUpload: {
      width: 100
    },
    customerPoReceiveDate: {
      width: 100
    },
    productionDue: {
      width: 100
    },
    xFactoryDate: {
      width: 100
    },
    arrival3Pl: {
      width: 100
    },
    readyToShip3Pl: {
      width: 100
    },
    inDcStoreDate: {
      width: 100
    }
  }
};
