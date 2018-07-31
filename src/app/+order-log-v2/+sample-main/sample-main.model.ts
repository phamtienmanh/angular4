import {
  ColumnsType
} from '../+outsource-main';
import {
  ColumnsTypeEnum
} from '../../shared/models';

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

export const SampleColumnsType = [
  ...findModelByListId([
    ColumnsTypeEnum.ArtRequested,
    ColumnsTypeEnum.ArtReceived,
    ColumnsTypeEnum.ArtReleased,
    ColumnsTypeEnum.TreatmentSampleDate,
    ColumnsTypeEnum.TreatmentPhotoApprovalTsc,
    ColumnsTypeEnum.EmbellishmentSampleDate,
    ColumnsTypeEnum.PhotoApprovalTsc,
    ColumnsTypeEnum.NeckPrintSampleDate,
    ColumnsTypeEnum.NeckPrintPhotoApprovalTsc,
    ColumnsTypeEnum.PhysSampleExFactoryDatePP,
    ColumnsTypeEnum.PhysSampleActualDateDeliveredPP,
    ColumnsTypeEnum.QCSampleShipDatePP,
    ColumnsTypeEnum.FinalApprovalPP
  ])
];

export const StyleColumns = {
  '8px': {
    customer: {
      width: 80,
      cellClass: 'columns-80'
    },
    csr: {
      width: 80,
      cellClass: 'columns-80'
    },
    vendor: {
      width: 50,
      cellClass: 'columns-50'
    },
    partnerStyleName: {
      width: 70,
      cellClass: 'columns-70'
    },
    art: {
      width: 60,
      cellClass: 'columns-60'
    },
    a2000Color: {
      width: 70,
      cellClass: 'columns-70'
    },
    blankColor: {
      width: 70,
      cellClass: 'columns-70'
    },
    treatmentType: {
      width: 70,
      cellClass: 'columns-70'
    },
    embellishmentType: {
      width: 60,
      cellClass: 'columns-60'
    },
    conceptApporved: {
      width: 80,
      cellClass: 'columns-80'
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
    blanksReceived: {
      width: 70,
      cellClass: 'columns-70'
    },
    approvalProcess: {
      width: 70,
      cellClass: 'columns-70'
    },
    ppCustomerQty: {
      width: 80,
      cellClass: 'columns-80'
    },
    factory: {
      width: 70,
      cellClass: 'columns-70'
    },
    treatmentSampleDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    treatmentPhotoApprovalTsc: {
      width: 80,
      cellClass: 'columns-80'
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
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleExFactoryDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleActualDateDelivered: {
      width: 80,
      cellClass: 'columns-80'
    },
    qcSampleShipDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    trackingNumber: {
      width: 70,
      cellClass: 'columns-70'
    },
    finalApproval: {
      width: 70,
      cellClass: 'columns-70'
    },
    comments: {
      width: 70,
      cellClass: 'columns-70'
    }
  },
  '9px': {
    customer: {
      width: 80,
      cellClass: 'columns-80'
    },
    csr: {
      width: 80,
      cellClass: 'columns-80'
    },
    vendor: {
      width: 60,
      cellClass: 'columns-60'
    },
    partnerStyleName: {
      width: 80,
      cellClass: 'columns-80'
    },
    art: {
      width: 70,
      cellClass: 'columns-70'
    },
    a2000Color: {
      width: 80,
      cellClass: 'columns-80'
    },
    blankColor: {
      width: 80,
      cellClass: 'columns-80'
    },
    treatmentType: {
      width: 70,
      cellClass: 'columns-70'
    },
    embellishmentType: {
      width: 70,
      cellClass: 'columns-70'
    },
    conceptApporved: {
      width: 80,
      cellClass: 'columns-80'
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
    blanksReceived: {
      width: 70,
      cellClass: 'columns-70'
    },
    approvalProcess: {
      width: 70,
      cellClass: 'columns-70'
    },
    ppCustomerQty: {
      width: 80,
      cellClass: 'columns-80'
    },
    factory: {
      width: 70,
      cellClass: 'columns-70'
    },
    treatmentSampleDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    treatmentPhotoApprovalTsc: {
      width: 80,
      cellClass: 'columns-80'
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
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleExFactoryDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    physSampleActualDateDelivered: {
      width: 80,
      cellClass: 'columns-80'
    },
    qcSampleShipDate: {
      width: 70,
      cellClass: 'columns-70'
    },
    trackingNumber: {
      width: 70,
      cellClass: 'columns-70'
    },
    finalApproval: {
      width: 70,
      cellClass: 'columns-70'
    },
    comments: {
      width: 70,
      cellClass: 'columns-70'
    }
  },
  '10px': {
    customer: {
      width: 80,
      cellClass: 'columns-80'
    },
    csr: {
      width: 90,
      cellClass: 'columns-90'
    },
    vendor: {
      width: 60,
      cellClass: 'columns-60'
    },
    partnerStyleName: {
      width: 90,
      cellClass: 'columns-90'
    },
    art: {
      width: 80,
      cellClass: 'columns-80'
    },
    a2000Color: {
      width: 90,
      cellClass: 'columns-90'
    },
    blankColor: {
      width: 90,
      cellClass: 'columns-90'
    },
    treatmentType: {
      width: 80,
      cellClass: 'columns-80'
    },
    embellishmentType: {
      width: 80,
      cellClass: 'columns-80'
    },
    conceptApporved: {
      width: 90,
      cellClass: 'columns-90'
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
    blanksReceived: {
      width: 80,
      cellClass: 'columns-80'
    },
    approvalProcess: {
      width: 80,
      cellClass: 'columns-80'
    },
    ppCustomerQty: {
      width: 90,
      cellClass: 'columns-90'
    },
    factory: {
      width: 80,
      cellClass: 'columns-80'
    },
    treatmentSampleDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    treatmentPhotoApprovalTsc: {
      width: 90,
      cellClass: 'columns-90'
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
      width: 90,
      cellClass: 'columns-90'
    },
    physSampleExFactoryDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    physSampleActualDateDelivered: {
      width: 90,
      cellClass: 'columns-90'
    },
    qcSampleShipDate: {
      width: 80,
      cellClass: 'columns-80'
    },
    trackingNumber: {
      width: 80,
      cellClass: 'columns-80'
    },
    finalApproval: {
      width: 80,
      cellClass: 'columns-80'
    },
    comments: {
      width: 80,
      cellClass: 'columns-80'
    }
  },
  '11px': {
    customer: {
      width: 80,
      cellClass: 'columns-80'
    },
    csr: {
      width: 100,
      cellClass: 'columns-100'
    },
    vendor: {
      width: 70,
      cellClass: 'columns-70'
    },
    partnerStyleName: {
      width: 90,
      cellClass: 'columns-90'
    },
    art: {
      width: 90,
      cellClass: 'columns-90'
    },
    a2000Color: {
      width: 90,
      cellClass: 'columns-90'
    },
    blankColor: {
      width: 90,
      cellClass: 'columns-90'
    },
    treatmentType: {
      width: 90,
      cellClass: 'columns-90'
    },
    embellishmentType: {
      width: 90,
      cellClass: 'columns-90'
    },
    conceptApporved: {
      width: 100,
      cellClass: 'columns-100'
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
    blanksReceived: {
      width: 90,
      cellClass: 'columns-90'
    },
    approvalProcess: {
      width: 90,
      cellClass: 'columns-90'
    },
    ppCustomerQty: {
      width: 100,
      cellClass: 'columns-100'
    },
    factory: {
      width: 90,
      cellClass: 'columns-90'
    },
    treatmentSampleDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    treatmentPhotoApprovalTsc: {
      width: 100,
      cellClass: 'columns-100'
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
      width: 100,
      cellClass: 'columns-100'
    },
    physSampleExFactoryDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    physSampleActualDateDelivered: {
      width: 100,
      cellClass: 'columns-100'
    },
    qcSampleShipDate: {
      width: 90,
      cellClass: 'columns-90'
    },
    trackingNumber: {
      width: 90,
      cellClass: 'columns-90'
    },
    finalApproval: {
      width: 90,
      cellClass: 'columns-90'
    },
    comments: {
      width: 90,
      cellClass: 'columns-90'
    }
  },
  '12px': {
    customer: {
      width: 80,
      cellClass: 'columns-80'
    },
    csr: {
      width: 110,
      cellClass: 'columns-110'
    },
    vendor: {
      width: 80,
      cellClass: 'columns-80'
    },
    partnerStyleName: {
      width: 100,
      cellClass: 'columns-100'
    },
    art: {
      width: 100,
      cellClass: 'columns-100'
    },
    a2000Color: {
      width: 100,
      cellClass: 'columns-100'
    },
    blankColor: {
      width: 100,
      cellClass: 'columns-100'
    },
    treatmentType: {
      width: 100,
      cellClass: 'columns-100'
    },
    embellishmentType: {
      width: 100,
      cellClass: 'columns-100'
    },
    conceptApporved: {
      width: 110,
      cellClass: 'columns-110'
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
      width: 100,
      cellClass: 'columns-100'
    },
    blanksReceived: {
      width: 100,
      cellClass: 'columns-100'
    },
    approvalProcess: {
      width: 100,
      cellClass: 'columns-100'
    },
    ppCustomerQty: {
      width: 110,
      cellClass: 'columns-110'
    },
    factory: {
      width: 100,
      cellClass: 'columns-100'
    },
    treatmentSampleDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    treatmentPhotoApprovalTsc: {
      width: 110,
      cellClass: 'columns-110'
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
      width: 110,
      cellClass: 'columns-110'
    },
    physSampleExFactoryDate: {
      width: 110,
      cellClass: 'columns-110'
    },
    physSampleActualDateDelivered: {
      width: 110,
      cellClass: 'columns-110'
    },
    qcSampleShipDate: {
      width: 100,
      cellClass: 'columns-100'
    },
    trackingNumber: {
      width: 100,
      cellClass: 'columns-100'
    },
    finalApproval: {
      width: 100,
      cellClass: 'columns-100'
    },
    comments: {
      width: 100,
      cellClass: 'columns-100'
    }
  }
};
