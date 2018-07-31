import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  routes
} from './project-primary.routes';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';

// Modules
import {
  PaginationControlModule
} from '../../../shared/modules/pagination-control';
import {
  ImgZoomClickModule
} from '../../../shared/modules/img-zoom-click';
import {
  ClickOutsideModule
} from 'ng-click-outside';
import {
  CostingModule,
  TscPresentationDateModule,
  TscConceptBoardsModule,
  LicensorSelectionModule,
  ConceptApprovedModule,
  PackagingApprovedModule,
  TechDesignModule,
  SamplesDeliveredModule,
  BulkUploadModule,
  CustomerPoReceiveModule,
  Arrival3plModule,
  PhysSampleActualModule,
  PpTestingFacilityModule,
  PhysSampleApprovedModule,
  PhysSampleDeliveredModule,
  PhysSampleExfactoryModule,
  FinalApprovalModule,
  QcSampleShipModule,
  XFactoryDateModule,
  ReadyToShip3plModule,
  LeadTimeModule
} from './modules';
import {
  ProductInfoModule
} from '../../+products-main/+product-info';

// Components
import {
  ProjectPrimaryComponent
} from './project-primary.component';
import {
  ColumnInfoModule
} from '../../../+order-log-v2/+outsource-main/components';

// Services
import {
  ProjectPrimaryService
} from './project-primary.service';
import {
  ExtendedHttpService
} from '../../../shared/services/http';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import {
  OutsourceMainService
} from '../../../+order-log-v2/+outsource-main/outsource-main.service';

@NgModule({
  declarations: [
    ProjectPrimaryComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MyDatePickerModule,
    ImgZoomClickModule,
    PaginationControlModule,
    MomentModule,
    ClickOutsideModule,
    CostingModule,
    TscConceptBoardsModule,
    TscPresentationDateModule,
    LicensorSelectionModule,
    ConceptApprovedModule,
    PackagingApprovedModule,
    TechDesignModule,
    SamplesDeliveredModule,
    BulkUploadModule,
    CustomerPoReceiveModule,
    Arrival3plModule,
    PhysSampleActualModule,
    PpTestingFacilityModule,
    PhysSampleApprovedModule,
    PhysSampleDeliveredModule,
    PhysSampleExfactoryModule,
    FinalApprovalModule,
    QcSampleShipModule,
    XFactoryDateModule,
    ReadyToShip3plModule,
    ProductInfoModule,
    LeadTimeModule,
    ColumnInfoModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    ProjectPrimaryService,
    EditUserService,
    OutsourceMainService
  ]
})
export class ProjectPrimaryModule {}
