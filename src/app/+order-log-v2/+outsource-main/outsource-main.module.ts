import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../shared/common';

import {
  OutsourceMainComponent
} from './outsource-main.component';

import {
  routes
} from './outsource-main.routes';

// Components
import {
  PoIssueDateModule,
  OwsTechPackReadyModule,
  ArtRequestedModule,
  ArtReceivedModule,
  ArtReleasedModule,
  TreatmentSampleModule,
  TreatmentPhotoModule,
  EmbellishmentSampleModule,
  PhotoApprovalModule,
  NeckPrintSampleModule,
  NeckLabelPhotoModule,
  PhysSampleExfactoryModule,
  PpTestingFacilityModule,
  PhysSampleDeliveredModule,
  PhysSampleActualModule,
  PhysSampleApprovedModule,
  QcSampleShipModule,
  FinalApprovalModule,
  NeckLabelProductionModule,
  EmbellishmentProductionModule,
  WashProductionModule,
  TopDueModule,
  PhysSampleExfactoryTopModule,
  PhysSampleActualTopModule,
  QcSampleShipTopModule,
  ShippingLabelsTscModule,
  FactoryPackingListModule,
  XFactoryDateModule,
  ReadyToShip3plModule,
  EtaTscModule,
  TrimSubmitsDueModule,
  BlankGoodsModule,
  LeadTimeModule,
  ProductionDueV2Module
} from './modules';
import {
  ActualToShipModule,
  FolderSubmittedModule,
  InvoicedModule
} from '../+order-main/modules';
import {
  OutsourceMainFilterComponent,
  ColumnInfoModule,
  LabelStatusModule
} from './components';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  ClickOutsideModule
} from 'ng-click-outside';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';
import {
  ContextMenuModule
} from 'ngx-contextmenu';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  InputDebounceModule
} from '../../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../../shared/modules/pagination-control';
import {
  ImgZoomClickModule
} from '../../shared/modules/img-zoom-click';
import {
  PermissionModule
} from '../../shared/modules/permission';
import {
  FitContentModule
} from '../../shared/directives/fit-content';
import {
  NoEmptyModule
} from '../../shared/modules/no-empty';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';
import {
  CommonService
} from '../../shared/services/common';
import {
  OutsourceMainService
} from './outsource-main.service';
import {
  EditUserService
} from '../../+user-management/+edit-user/edit-user.service';
import {
  OutsourceMainAuth
} from './outsource-main.auth';

@NgModule({
  declarations: [
    OutsourceMainComponent,
    OutsourceMainFilterComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    InputDebounceModule,
    PaginationControlModule,
    NgxDatatableModule,
    NgSelectModule,
    ClickOutsideModule,
    ImgZoomClickModule,
    MyDatePickerModule,
    MomentModule,
    PoIssueDateModule,
    PermissionModule,
    FitContentModule,
    OwsTechPackReadyModule,
    ArtRequestedModule,
    ArtReceivedModule,
    ArtReleasedModule,
    TreatmentSampleModule,
    TreatmentPhotoModule,
    EmbellishmentSampleModule,
    PhotoApprovalModule,
    NeckPrintSampleModule,
    NeckLabelPhotoModule,
    PhysSampleExfactoryModule,
    PpTestingFacilityModule,
    PhysSampleDeliveredModule,
    PhysSampleActualModule,
    PhysSampleApprovedModule,
    QcSampleShipModule,
    FinalApprovalModule,
    NeckLabelProductionModule,
    EmbellishmentProductionModule,
    WashProductionModule,
    TopDueModule,
    PhysSampleExfactoryTopModule,
    PhysSampleActualTopModule,
    QcSampleShipTopModule,
    ShippingLabelsTscModule,
    FactoryPackingListModule,
    XFactoryDateModule,
    ReadyToShip3plModule,
    EtaTscModule,
    ActualToShipModule,
    FolderSubmittedModule,
    InvoicedModule,
    TrimSubmitsDueModule,
    BlankGoodsModule,
    NoEmptyModule,
    ColumnInfoModule,
    LabelStatusModule,
    LeadTimeModule,
    ProductionDueV2Module,
    ContextMenuModule.forRoot({
      autoFocus: true,
      useBootstrap4: true
    })
  ],
  providers: [
    ExtendedHttpService,
    CommonService,
    OutsourceMainService,
    EditUserService,
    OutsourceMainAuth
  ]
})
export class OutsourceMainModule {
}
