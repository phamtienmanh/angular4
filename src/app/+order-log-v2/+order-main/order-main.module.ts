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
  OrderMainComponent
} from './order-main.component';

import {
  routes
} from './order-main.routes';

// Components
import {
  PrintDateModule,
  NeckLabelDateModule,
  SpecialtyTreatmentModule,
  ReadyToShipModule,
  PickPackDateModule,
  FinishingDateModule,
  ActualToShipModule,
  NeckLabelApprovalModule,
  TeckPackReadyModule,
  FolderReadyModule,
  CreditApprovalModule,
  CutTicketModule,
  BlankGoodsModule,
  OrderStagedModule,
  TrimEtaModule,
  TeckPackSheetModule,
  SampleApprovalModule,
  FolderSubmittedModule,
  InvoicedModule,
  ArtReleasedModule,
  QaModule,
  ShippingLabelsTscModule,
  PrintDateStatusModule,
  AddCommentModule,
  EtaTscModule,
  ConfirmReorderModule
} from './modules';
import {
  OrderMainFilterComponent
} from './components';
import {
  OrderNotificationComponent
} from './order-notification/order-notification.component';
import {
  AddOrderComponent
} from './order-notification/add-order';

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
  FileUploadModule
} from 'ng2-file-upload';
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
  UploaderTypeModule
} from '../../shared/modules/uploader-type';
import {
  UploadModule
} from '../+sales-order/+order-styles/+styles-info/+print-location/modules';
import {
  PermissionModule
} from '../../shared/modules/permission';
import {
  NoEmptyModule
} from '../../shared/modules/no-empty';
import {
  FitContentModule
} from '../../shared/directives/fit-content';
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';
import {
  LabelStatusModule
} from '../+order-main/components';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';
import {
  CommonService
} from '../../shared/services/common';
import {
  ValidationService
} from '../../shared/services/validation';
import {
  OrderMainService
} from './order-main.service';
import {
  EditUserService
} from '../../+user-management/+edit-user/edit-user.service';
import {
  LocationDetailService
} from '../+sales-order/+order-styles/+styles-info/+print-location/+location-detail';
import {
  StyleService
} from '../+sales-order/+order-styles/+styles-info/+style/style.service';
import { OrderMainAuth } from './order-main.auth';

@NgModule({
  declarations: [
    OrderMainComponent,
    OrderMainFilterComponent,
    OrderNotificationComponent,
    AddOrderComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    InputDebounceModule,
    PaginationControlModule,
    NgxDatatableModule,
    ClickOutsideModule,
    ImgZoomClickModule,
    NgSelectModule,
    FileUploadModule,
    MyDatePickerModule,
    MomentModule,
    PrintDateModule,
    NeckLabelDateModule,
    SpecialtyTreatmentModule,
    ReadyToShipModule,
    PickPackDateModule,
    FinishingDateModule,
    ActualToShipModule,
    NeckLabelApprovalModule,
    TeckPackReadyModule,
    FolderReadyModule,
    CreditApprovalModule,
    CutTicketModule,
    BlankGoodsModule,
    OrderStagedModule,
    TeckPackSheetModule,
    SampleApprovalModule,
    TrimEtaModule,
    FolderSubmittedModule,
    InvoicedModule,
    UploaderTypeModule,
    UploadModule,
    PermissionModule,
    ArtReleasedModule,
    QaModule,
    NoEmptyModule,
    FitContentModule,
    PrintDateStatusModule,
    AddCommentModule,
    ShippingLabelsTscModule,
    ConfirmDialogModule,
    EtaTscModule,
    ConfirmReorderModule,
    LabelStatusModule,
    ContextMenuModule.forRoot({
      autoFocus: true,
      useBootstrap4: true
    })
  ],
  providers: [
    ExtendedHttpService,
    CommonService,
    ValidationService,
    OrderMainService,
    EditUserService,
    StyleService,
    LocationDetailService,
    OrderMainAuth
  ],
  entryComponents: [AddOrderComponent]
})
export class OrderMainModule {
}
