import {
  ColumnsType,
  ColumnsTypeEnum
} from '../../shared/models';

export interface ProductInfo {
  id: number;
  visualImageUrl: string;
  productName: string;
  styleName: string;
  upcNumber: string;
  categoryId: number;
  categoryName: string;
  project: string;
  typeId: number;
  typeName: string;
  factoryId: number;
  factoryName: string;
  regions: string[];
}

export interface ProductListResp {
  data: any[];
  totalRecord: number;
}

export enum ProductStatus {
  Active = 1,
  Archive = 2
}

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

export const ColumnsTypeProject = [
  ...findModelByListId([
    ColumnsTypeEnum.Costing,
    ColumnsTypeEnum.TscPresentationDate,
    ColumnsTypeEnum.TscConceptBoardsForSelection,
    ColumnsTypeEnum.RetailerSelectionWoConceptApproval,
    ColumnsTypeEnum.ConceptApprovedByLicensor,
    ColumnsTypeEnum.PackagingApprovedByLicensor,
    ColumnsTypeEnum.PhysSampleExFactoryDatePP,
    ColumnsTypeEnum.PhysSampleExFactoryDatePPToTestingFacility,
    ColumnsTypeEnum.PhysSampleDeliveredtoTestingFacilityPP,
    ColumnsTypeEnum.PhysSampleApprovedByTestingFacilityPP,
    ColumnsTypeEnum.PhysSampleActualDateDeliveredPP,
    ColumnsTypeEnum.TechDesignReviewDatePP,
    ColumnsTypeEnum.QCSampleShipDatePP,
    ColumnsTypeEnum.FinalApprovalPP,
    ColumnsTypeEnum.ProductionDue,
    ColumnsTypeEnum.XFactoryDate,
    ColumnsTypeEnum.ReadyToShip3PL
  ])
];
