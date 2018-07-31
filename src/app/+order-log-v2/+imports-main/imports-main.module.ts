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
  ImportsMainComponent
} from './imports-main.component';

import {
  routes
} from './imports-main.routes';

// Components
import {
  PoIssueDateModule,
  OwsTechPackReadyModule,
  ArtRequestedModule,
  ArtReceivedModule,
  ArtReleasedModule,
  FabricQualityDueModule,
  PhotoApprovalModule,
  PhysSampleExfactoryModule,
  PpTestingFacilityModule,
  PhysSampleDeliveredModule,
  PhysSampleActualModule,
  PhysSampleApprovedModule,
  QcSampleShipModule,
  FinalApprovalModule,
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
  BulkFabricModule,
  LeadTimeModule,
  LabDipsDueModule,
  FitSampleDueModule,
  PpSampleDueModule,
  StrikeOffKnitDownDueModule,
  PackingValidationDueModule,
  FinalApprovalTopModule,
  ProductionDueV2Module,
  TechDesignModule
} from './modules';
import {
  ImportMainFilterComponent,
  ColumnInfoModule
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
  ImportsMainService
} from './imports-main.service';
import {
  EditUserService
} from '../../+user-management/+edit-user/edit-user.service';
import {
  ImportsMainAuth
} from './imports-main.auth';
import {
  OwsTechpackService
} from '../+sales-order/+order-styles/+styles-info/+ows-techpack/ows-techpack.service';

@NgModule({
  declarations: [
    ImportsMainComponent,
    ImportMainFilterComponent,
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
    FabricQualityDueModule,
    PhotoApprovalModule,
    PhysSampleExfactoryModule,
    PpTestingFacilityModule,
    PhysSampleDeliveredModule,
    PhysSampleActualModule,
    PhysSampleApprovedModule,
    QcSampleShipModule,
    FinalApprovalModule,
    TopDueModule,
    PhysSampleExfactoryTopModule,
    PhysSampleActualTopModule,
    QcSampleShipTopModule,
    ShippingLabelsTscModule,
    FactoryPackingListModule,
    XFactoryDateModule,
    ReadyToShip3plModule,
    EtaTscModule,
    TechDesignModule,
    TrimSubmitsDueModule,
    BulkFabricModule,
    NoEmptyModule,
    ColumnInfoModule,
    LeadTimeModule,
    LabDipsDueModule,
    FitSampleDueModule,
    PpSampleDueModule,
    StrikeOffKnitDownDueModule,
    PackingValidationDueModule,
    FinalApprovalTopModule,
    ProductionDueV2Module,
    ContextMenuModule.forRoot({
      autoFocus: true,
      useBootstrap4: true
    })
  ],
  providers: [
    ExtendedHttpService,
    CommonService,
    ImportsMainService,
    EditUserService,
    OwsTechpackService,
    ImportsMainAuth
  ]
})
export class ImportsMainModule {
}
