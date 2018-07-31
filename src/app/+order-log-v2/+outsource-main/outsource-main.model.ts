import { OrderLogType } from '../+order-main';
import {
  ColumnsTypeEnum,
  ColumnsType
} from '../../shared/models';

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

export const ColumnsTypeOutsource = [
  ...findModelByListId([
    ColumnsTypeEnum.PoIssueDue,
    ColumnsTypeEnum.OwsTechPackReady,
    ColumnsTypeEnum.BlankGoodsEta,
    ColumnsTypeEnum.ArtRequested,
    ColumnsTypeEnum.ArtReceived,
    ColumnsTypeEnum.ArtReleased,
    ColumnsTypeEnum.TreatmentSampleDate,
    ColumnsTypeEnum.TreatmentPhotoApprovalTsc,
    ColumnsTypeEnum.EmbellishmentSampleDate,
    ColumnsTypeEnum.PhotoApprovalTsc,
    ColumnsTypeEnum.NeckPrintSampleDate,
    ColumnsTypeEnum.NeckPrintPhotoApprovalTsc,
    ColumnsTypeEnum.TrimSubmitsDue,
    ColumnsTypeEnum.PhysSampleExFactoryDatePP,
    ColumnsTypeEnum.PhysSampleExFactoryDatePPToTestingFacility,
    ColumnsTypeEnum.PhysSampleDeliveredtoTestingFacilityPP,
    ColumnsTypeEnum.PhysSampleActualDateDeliveredPP,
    ColumnsTypeEnum.QCSampleShipDatePP,
    ColumnsTypeEnum.PhysSampleApprovedByTestingFacilityPP,
    ColumnsTypeEnum.FinalApprovalPP,
    ColumnsTypeEnum.ProductionDue,
    ColumnsTypeEnum.TOPDue,
    ColumnsTypeEnum.PhysSampleExFactoryDateTOP,
    ColumnsTypeEnum.PhysSampleActualDateDeliveredTOP,
    ColumnsTypeEnum.QCSampleShipDateTOP,
    ColumnsTypeEnum.ShippingLabelsTSCPackingList,
    ColumnsTypeEnum.FactoryPackingListCI,
    ColumnsTypeEnum.XFactoryDate,
    ColumnsTypeEnum.ReadyToShip3PL,
    ColumnsTypeEnum.ActualShipDate,
    ColumnsTypeEnum.ShippingDocumentation,
    ColumnsTypeEnum.Invoiced
  ])
];

export const OutsourceType = OrderLogType;

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
    blankStyle: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabel: {
      width: 80,
      cellClass: 'columns-80'
    },
    styleInfo: {
      width: 80,
      cellClass: 'columns-80'
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
    blankGoodsEta: {
      width: 80,
      cellClass: 'columns-80'
    },
    treatmentSampleDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    treatmentPhotoApprovalTsc: {
      width: 70,
      cellClass: 'columns-70'
    },
    embellishmentSampleDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    photoApprovalTsc: {
      width: 70,
      cellClass: 'columns-70'
    },
    neckPrintSampleDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    neckPrintPhotoApprovalTsc: {
      width: 70,
      cellClass: 'columns-70'
    },
    trimSubmitsDue: {
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
    qcSampleShipDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    finalApproval: {
      width: 70,
      cellClass: 'columns-70'
    },
    neckLabelProduction: {
      width: 70,
      cellClass: 'columns-70'
    },
    embellishmentProduction: {
      width: 70,
      cellClass: 'columns-70'
    },
    washProduction: {
      width: 70,
      cellClass: 'columns-70'
    },
    productionDue: {
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
    etaTsc: {
      width: 70,
      cellClass: 'columns-70'
    },
    actualToShipDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    shippingDocumentation: {
      width: 80,
      cellClass: 'columns-80'
    },
    invoiced: {
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
    blankStyle: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabel: {
      width: 80,
      cellClass: 'columns-80'
    },
    styleInfo: {
      width: 80,
      cellClass: 'columns-80'
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
    blankGoodsEta: {
      width: 80,
      cellClass: 'columns-80'
    },
    treatmentSampleDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    treatmentPhotoApprovalTsc: {
      width: 70,
      cellClass: 'columns-70'
    },
    embellishmentSampleDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    photoApprovalTsc: {
      width: 70,
      cellClass: 'columns-70'
    },
    neckPrintSampleDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    neckPrintPhotoApprovalTsc: {
      width: 70,
      cellClass: 'columns-70'
    },
    trimSubmitsDue: {
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
    qcSampleShipDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    finalApproval: {
      width: 70,
      cellClass: 'columns-70'
    },
    neckLabelProduction: {
      width: 70,
      cellClass: 'columns-70'
    },
    embellishmentProduction: {
      width: 70,
      cellClass: 'columns-70'
    },
    washProduction: {
      width: 70,
      cellClass: 'columns-70'
    },
    productionDue: {
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
    etaTsc: {
      width: 70,
      cellClass: 'columns-70'
    },
    actualToShipDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    shippingDocumentation: {
      width: 80,
      cellClass: 'columns-80'
    },
    invoiced: {
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
    blankStyle: {
      width: 90,
      cellClass: 'columns-90'
    },
    neckLabel: {
      width: 90,
      cellClass: 'columns-90'
    },
    styleInfo: {
      width: 90,
      cellClass: 'columns-90'
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
    blankGoodsEta: {
      width: 90,
      cellClass: 'columns-90'
    },
    treatmentSampleDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    treatmentPhotoApprovalTsc: {
      width: 80,
      cellClass: 'columns-80'
    },
    embellishmentSampleDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    photoApprovalTsc: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckPrintSampleDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckPrintPhotoApprovalTsc: {
      width: 80,
      cellClass: 'columns-80'
    },
    trimSubmitsDue: {
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
    qcSampleShipDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    finalApproval: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabelProduction: {
      width: 80,
      cellClass: 'columns-80'
    },
    embellishmentProduction: {
      width: 80,
      cellClass: 'columns-80'
    },
    washProduction: {
      width: 80,
      cellClass: 'columns-80'
    },
    productionDue: {
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
    etaTsc: {
      width: 80,
      cellClass: 'columns-80'
    },
    actualToShipDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    shippingDocumentation: {
      width: 90,
      cellClass: 'columns-90'
    },
    invoiced: {
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
    blankStyle: {
      width: 100,
      cellClass: 'columns-100'
    },
    neckLabel: {
      width: 100,
      cellClass: 'columns-100'
    },
    styleInfo: {
      width: 100,
      cellClass: 'columns-100'
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
    blankGoodsEta: {
      width: 100,
      cellClass: 'columns-100'
    },
    treatmentSampleDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    treatmentPhotoApprovalTsc: {
      width: 90,
      cellClass: 'columns-90'
    },
    embellishmentSampleDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    photoApprovalTsc: {
      width: 90,
      cellClass: 'columns-90'
    },
    neckPrintSampleDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    neckPrintPhotoApprovalTsc: {
      width: 90,
      cellClass: 'columns-90'
    },
    trimSubmitsDue: {
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
    qcSampleShipDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    finalApproval: {
      width: 90,
      cellClass: 'columns-90'
    },
    neckLabelProduction: {
      width: 90,
      cellClass: 'columns-90'
    },
    embellishmentProduction: {
      width: 90,
      cellClass: 'columns-90'
    },
    washProduction: {
      width: 90,
      cellClass: 'columns-90'
    },
    productionDue: {
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
    etaTsc: {
      width: 90,
      cellClass: 'columns-90'
    },
    actualToShipDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    shippingDocumentation: {
      width: 100,
      cellClass: 'columns-100'
    },
    invoiced: {
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
    blankStyle: {
      width: 110,
      cellClass: 'columns-110'
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
    blankGoodsEta: {
      width: 110,
      cellClass: 'columns-110'
    },
    treatmentSampleDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    treatmentPhotoApprovalTsc: {
      width: 100,
      cellClass: 'columns-100'
    },
    embellishmentSampleDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    photoApprovalTsc: {
      width: 100,
      cellClass: 'columns-100'
    },
    neckPrintSampleDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    neckPrintPhotoApprovalTsc: {
      width: 100,
      cellClass: 'columns-100'
    },
    trimSubmitsDue: {
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
    qcSampleShipDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    finalApproval: {
      width: 100,
      cellClass: 'columns-100'
    },
    neckLabelProduction: {
      width: 100,
      cellClass: 'columns-100'
    },
    embellishmentProduction: {
      width: 100,
      cellClass: 'columns-100'
    },
    washProduction: {
      width: 100,
      cellClass: 'columns-100'
    },
    productionDue: {
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
    etaTsc: {
      width: 100,
      cellClass: 'columns-100'
    },
    actualToShipDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    shippingDocumentation: {
      width: 110,
      cellClass: 'columns-110'
    },
    invoiced: {
      width: 100,
      cellClass: 'columns-100'
    }
  }
};
