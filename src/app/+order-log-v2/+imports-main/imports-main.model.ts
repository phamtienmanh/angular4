import {
  ColumnsTypeEnum
} from '../../shared/models';
import { OrderLogType } from '../+order-main';
import { ColumnsType } from '../+outsource-main';

export const ImportType = OrderLogType;

export * from '../../shared/models/column-status.model';

const findModelByListId = (ids: number[]) => {
  let model = [];
  ids.forEach((id) => {
    const col = ColumnsType.find((j) => j.id === id);
    if (col) {
      model.push(col);
    }
  });
  return model;
};

export const ColumnsTypeImport = [
  ...findModelByListId([
    ColumnsTypeEnum.PoIssueDue,
    ColumnsTypeEnum.OwsTechPackReady,
    ColumnsTypeEnum.ArtRequested,
    ColumnsTypeEnum.ArtReceived,
    ColumnsTypeEnum.ArtReleased,
    ColumnsTypeEnum.FabricQualityDue,
    ColumnsTypeEnum.LabDipDue,
    ColumnsTypeEnum.FitSampleDue,
    ColumnsTypeEnum.TrimSubmitsDue,
    ColumnsTypeEnum.BulkFabric,
    ColumnsTypeEnum.StrikeOffKnitDownDue,
    ColumnsTypeEnum.PPSampleDue,
    ColumnsTypeEnum.PhysSampleExFactoryDatePP,
    ColumnsTypeEnum.PhysSampleExFactoryDatePPToTestingFacility,
    ColumnsTypeEnum.PhysSampleDeliveredtoTestingFacilityPP,
    ColumnsTypeEnum.PhysSampleActualDateDeliveredPP,
    ColumnsTypeEnum.TechDesignReviewDatePP,
    ColumnsTypeEnum.QCSampleShipDatePP,
    ColumnsTypeEnum.PhysSampleApprovedByTestingFacilityPP,
    ColumnsTypeEnum.FinalApprovalPP,
    ColumnsTypeEnum.ProductionDue,
    ColumnsTypeEnum.PackingValidationDue,
    ColumnsTypeEnum.TOPDue,
    ColumnsTypeEnum.PhysSampleExFactoryDateTOP,
    ColumnsTypeEnum.PhysSampleActualDateDeliveredTOP,
    ColumnsTypeEnum.QCSampleShipDateTOP,
    ColumnsTypeEnum.FinalApprovalTOP,
    ColumnsTypeEnum.ShippingLabelsTSCPackingList,
    ColumnsTypeEnum.FactoryPackingListCI,
    ColumnsTypeEnum.XFactoryDate,
    ColumnsTypeEnum.ReadyToShip3PL,
    ColumnsTypeEnum.ETATSC,
  ])
];

export const StyleColumns = {
  '8px': {
    csr: {
      width: 90,
      cellClass: 'columns-90'
    },
    factory: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabel: {
      width: 80,
      cellClass: 'columns-80'
    },
    styleInfo: {
      width: 90,
      cellClass: 'columns-90'
    },
    art: {
      width: 70,
      cellClass: 'columns-70'
    },
    poIssueDueDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    owsTechPackReady: {
      width: 70,
      cellClass: 'columns-70'
    },
    artRequested: {
      width: 70,
      cellClass: 'columns-70'
    },
    artReceived: {
      width: 70,
      cellClass: 'columns-70'
    },
    artReleased: {
      width: 70,
      cellClass: 'columns-70'
    },
    fabricQualityDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    labDipsDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    fitSampleDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    trimSubmitsDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    bulkFabric: {
      width: 70,
      cellClass: 'columns-70'
    },
    strikeOffKnitDownDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    ppSampleDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleExFactoryDatePp: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleExFactoryDatePpToTestingFacility: {
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleDeliveredToTestingFacilityPp: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleApprovedByTestingFacilityPp: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleActualDateDeliveredPp: {
      width: 70,
      cellClass: 'columns-70'
    },
    techDesignReviewDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    qcSampleShipDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    finalApproval: {
      width: 70,
      cellClass: 'columns-70'
    },
    productionDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    packingValidationDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    topDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleExFactoryDateTop: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleActualDateDeliveredTop: {
      width: 70,
      cellClass: 'columns-70'
    },
    qcSampleShipDateTop: {
      width: 70,
      cellClass: 'columns-70'
    },
    finalApprovalTop: {
      width: 70,
      cellClass: 'columns-70'
    },
    shippingLabelsTscPackingList: {
      width: 70,
      cellClass: 'columns-70'
    },
    factoryPackingListCi: {
      width: 70,
      cellClass: 'columns-70'
    },
    xFactoryDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    readyToShip3Pl: {
      width: 70,
      cellClass: 'columns-70'
    },
    etatsc: {
      width: 70,
      cellClass: 'columns-70'
    }
  },
  '9px': {
    csr: {
      width: 90,
      cellClass: 'columns-90'
    },
    factory: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabel: {
      width: 80,
      cellClass: 'columns-80'
    },
    styleInfo: {
      width: 90,
      cellClass: 'columns-90'
    },
    art: {
      width: 70,
      cellClass: 'columns-70'
    },
    poIssueDueDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    owsTechPackReady: {
      width: 70,
      cellClass: 'columns-70'
    },
    artRequested: {
      width: 70,
      cellClass: 'columns-70'
    },
    artReceived: {
      width: 70,
      cellClass: 'columns-70'
    },
    artReleased: {
      width: 70,
      cellClass: 'columns-70'
    },
    fabricQualityDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    labDipsDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    fitSampleDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    trimSubmitsDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    bulkFabric: {
      width: 70,
      cellClass: 'columns-70'
    },
    strikeOffKnitDownDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    ppSampleDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleExFactoryDatePp: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleExFactoryDatePpToTestingFacility: {
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleDeliveredToTestingFacilityPp: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleApprovedByTestingFacilityPp: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleActualDateDeliveredPp: {
      width: 70,
      cellClass: 'columns-70'
    },
    techDesignReviewDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    qcSampleShipDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    finalApproval: {
      width: 70,
      cellClass: 'columns-70'
    },
    productionDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    packingValidationDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    topDue: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleExFactoryDateTop: {
      width: 70,
      cellClass: 'columns-70'
    },
    physSampleActualDateDeliveredTop: {
      width: 70,
      cellClass: 'columns-70'
    },
    qcSampleShipDateTop: {
      width: 70,
      cellClass: 'columns-70'
    },
    finalApprovalTop: {
      width: 70,
      cellClass: 'columns-70'
    },
    shippingLabelsTscPackingList: {
      width: 70,
      cellClass: 'columns-70'
    },
    factoryPackingListCi: {
      width: 70,
      cellClass: 'columns-70'
    },
    xFactoryDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    readyToShip3Pl: {
      width: 70,
      cellClass: 'columns-70'
    },
    etatsc: {
      width: 70,
      cellClass: 'columns-70'
    }
  },
  '10px': {
    csr: {
      width: 100,
      cellClass: 'columns-100'
    },
    factory: {
      width: 90,
      cellClass: 'columns-90'
    },
    neckLabel: {
      width: 90,
      cellClass: 'columns-90'
    },
    styleInfo: {
      width: 100,
      cellClass: 'columns-100'
    },
    art: {
      width: 80,
      cellClass: 'columns-80'
    },
    poIssueDueDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    owsTechPackReady: {
      width: 80,
      cellClass: 'columns-80'
    },
    artRequested: {
      width: 80,
      cellClass: 'columns-80'
    },
    artReceived: {
      width: 80,
      cellClass: 'columns-80'
    },
    artReleased: {
      width: 80,
      cellClass: 'columns-80'
    },
    fabricQualityDue: {
      width: 80,
      cellClass: 'columns-80'
    },
    labDipsDue: {
      width: 80,
      cellClass: 'columns-80'
    },
    fitSampleDue: {
      width: 80,
      cellClass: 'columns-80'
    },
    trimSubmitsDue: {
      width: 80,
      cellClass: 'columns-80'
    },
    bulkFabric: {
      width: 80,
      cellClass: 'columns-80'
    },
    strikeOffKnitDownDue: {
      width: 80,
      cellClass: 'columns-80'
    },
    ppSampleDue: {
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleExFactoryDatePp: {
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleExFactoryDatePpToTestingFacility: {
      width: 90,
      cellClass: 'columns-90'
    },
    physSampleDeliveredToTestingFacilityPp: {
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleApprovedByTestingFacilityPp: {
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleActualDateDeliveredPp: {
      width: 80,
      cellClass: 'columns-80'
    },
    techDesignReviewDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    qcSampleShipDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    finalApproval: {
      width: 80,
      cellClass: 'columns-80'
    },
    productionDue: {
      width: 80,
      cellClass: 'columns-80'
    },
    packingValidationDue: {
      width: 80,
      cellClass: 'columns-80'
    },
    topDue: {
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleExFactoryDateTop: {
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleActualDateDeliveredTop: {
      width: 80,
      cellClass: 'columns-80'
    },
    qcSampleShipDateTop: {
      width: 80,
      cellClass: 'columns-80'
    },
    finalApprovalTop: {
      width: 80,
      cellClass: 'columns-80'
    },
    shippingLabelsTscPackingList: {
      width: 80,
      cellClass: 'columns-80'
    },
    factoryPackingListCi: {
      width: 80,
      cellClass: 'columns-80'
    },
    xFactoryDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    readyToShip3Pl: {
      width: 80,
      cellClass: 'columns-80'
    },
    etatsc: {
      width: 80,
      cellClass: 'columns-80'
    }
  },
  '11px': {
    csr: {
      width: 110,
      cellClass: 'columns-110'
    },
    factory: {
      width: 100,
      cellClass: 'columns-100'
    },
    neckLabel: {
      width: 100,
      cellClass: 'columns-100'
    },
    styleInfo: {
      width: 110,
      cellClass: 'columns-110'
    },
    art: {
      width: 90,
      cellClass: 'columns-90'
    },
    poIssueDueDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    owsTechPackReady: {
      width: 90,
      cellClass: 'columns-90'
    },
    artRequested: {
      width: 90,
      cellClass: 'columns-90'
    },
    artReceived: {
      width: 90,
      cellClass: 'columns-90'
    },
    artReleased: {
      width: 90,
      cellClass: 'columns-90'
    },
    fabricQualityDue: {
      width: 90,
      cellClass: 'columns-90'
    },
    labDipsDue: {
      width: 90,
      cellClass: 'columns-90'
    },
    fitSampleDue: {
      width: 90,
      cellClass: 'columns-90'
    },
    trimSubmitsDue: {
      width: 90,
      cellClass: 'columns-90'
    },
    bulkFabric: {
      width: 90,
      cellClass: 'columns-90'
    },
    strikeOffKnitDownDue: {
      width: 90,
      cellClass: 'columns-90'
    },
    ppSampleDue: {
      width: 90,
      cellClass: 'columns-90'
    },
    physSampleExFactoryDatePp: {
      width: 90,
      cellClass: 'columns-90'
    },
    physSampleExFactoryDatePpToTestingFacility: {
      width: 100,
      cellClass: 'columns-100'
    },
    physSampleDeliveredToTestingFacilityPp: {
      width: 90,
      cellClass: 'columns-90'
    },
    physSampleApprovedByTestingFacilityPp: {
      width: 90,
      cellClass: 'columns-90'
    },
    physSampleActualDateDeliveredPp: {
      width: 90,
      cellClass: 'columns-90'
    },
    techDesignReviewDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    qcSampleShipDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    finalApproval: {
      width: 90,
      cellClass: 'columns-90'
    },
    productionDue: {
      width: 90,
      cellClass: 'columns-90'
    },
    packingValidationDue: {
      width: 90,
      cellClass: 'columns-90'
    },
    topDue: {
      width: 90,
      cellClass: 'columns-90'
    },
    physSampleExFactoryDateTop: {
      width: 90,
      cellClass: 'columns-90'
    },
    physSampleActualDateDeliveredTop: {
      width: 90,
      cellClass: 'columns-90'
    },
    qcSampleShipDateTop: {
      width: 90,
      cellClass: 'columns-90'
    },
    finalApprovalTop: {
      width: 90,
      cellClass: 'columns-90'
    },
    shippingLabelsTscPackingList: {
      width: 90,
      cellClass: 'columns-90'
    },
    factoryPackingListCi: {
      width: 90,
      cellClass: 'columns-90'
    },
    xFactoryDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    readyToShip3Pl: {
      width: 90,
      cellClass: 'columns-90'
    },
    etatsc: {
      width: 90,
      cellClass: 'columns-90'
    }
  },
  '12px': {
    csr: {
      width: 120,
      cellClass: 'columns-120'
    },
    factory: {
      width: 110,
      cellClass: 'columns-110'
    },
    neckLabel: {
      width: 110,
      cellClass: 'columns-110'
    },
    styleInfo: {
      width: 120,
      cellClass: 'columns-120'
    },
    art: {
      width: 100,
      cellClass: 'columns-100'
    },
    poIssueDueDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    owsTechPackReady: {
      width: 100,
      cellClass: 'columns-100'
    },
    artRequested: {
      width: 100,
      cellClass: 'columns-100'
    },
    artReceived: {
      width: 100,
      cellClass: 'columns-100'
    },
    artReleased: {
      width: 100,
      cellClass: 'columns-100'
    },
    fabricQualityDue: {
      width: 100,
      cellClass: 'columns-100'
    },
    labDipsDue: {
      width: 100,
      cellClass: 'columns-100'
    },
    fitSampleDue: {
      width: 100,
      cellClass: 'columns-100'
    },
    trimSubmitsDue: {
      width: 100,
      cellClass: 'columns-100'
    },
    bulkFabric: {
      width: 100,
      cellClass: 'columns-100'
    },
    strikeOffKnitDownDue: {
      width: 100,
      cellClass: 'columns-100'
    },
    ppSampleDue: {
      width: 100,
      cellClass: 'columns-100'
    },
    physSampleExFactoryDatePp: {
      width: 100,
      cellClass: 'columns-100'
    },
    physSampleExFactoryDatePpToTestingFacility: {
      width: 110,
      cellClass: 'columns-110'
    },
    physSampleDeliveredToTestingFacilityPp: {
      width: 100,
      cellClass: 'columns-100'
    },
    physSampleApprovedByTestingFacilityPp: {
      width: 100,
      cellClass: 'columns-100'
    },
    physSampleActualDateDeliveredPp: {
      width: 100,
      cellClass: 'columns-100'
    },
    techDesignReviewDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    qcSampleShipDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    finalApproval: {
      width: 100,
      cellClass: 'columns-100'
    },
    productionDue: {
      width: 100,
      cellClass: 'columns-100'
    },
    packingValidationDue: {
      width: 100,
      cellClass: 'columns-100'
    },
    topDue: {
      width: 100,
      cellClass: 'columns-100'
    },
    physSampleExFactoryDateTop: {
      width: 100,
      cellClass: 'columns-100'
    },
    physSampleActualDateDeliveredTop: {
      width: 100,
      cellClass: 'columns-100'
    },
    qcSampleShipDateTop: {
      width: 100,
      cellClass: 'columns-100'
    },
    finalApprovalTop: {
      width: 100,
      cellClass: 'columns-100'
    },
    shippingLabelsTscPackingList: {
      width: 100,
      cellClass: 'columns-100'
    },
    factoryPackingListCi: {
      width: 100,
      cellClass: 'columns-100'
    },
    xFactoryDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    readyToShip3Pl: {
      width: 100,
      cellClass: 'columns-100'
    },
    etatsc: {
      width: 100,
      cellClass: 'columns-100'
    }
  }
};
