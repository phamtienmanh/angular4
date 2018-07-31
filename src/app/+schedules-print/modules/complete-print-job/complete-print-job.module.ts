import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  CompletePrintJobComponent
} from './complete-print-job.component';

// 3rd modules
import {
  MomentModule
} from 'angular2-moment';
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  MyDatePickerModule
} from 'mydatepicker';
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import {
  InputDebounceModule
} from '../../../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../../../shared/modules/pagination-control';
import {
  PermissionModule
} from '../../../shared/modules/permission';
import {
  ConfirmDialogModule
} from '../../../shared/modules/confirm-dialog';
import {
  FocusOnInitModule
} from '../../../shared/modules/focus-on-init';
import { ScanBarcodeModule } from '../scan-barcode/scan-barcode.module';
import { ConfirmJobModule } from '../confirm-job/confirm-job.module';

// Services
import {
  CompletePrintJobService
} from './complete-print-job.servive';

@NgModule({
  declarations: [
    CompletePrintJobComponent
  ],
  entryComponents: [
    CompletePrintJobComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgxDatatableModule,
    NgSelectModule,
    InputDebounceModule,
    PaginationControlModule,
    PermissionModule,
    ConfirmDialogModule,
    MomentModule,
    FocusOnInitModule,
    ScanBarcodeModule,
    ConfirmJobModule
  ],
  exports: [
    CompletePrintJobComponent
  ],
  providers: [
    CompletePrintJobService
  ]
})
export class CompletePrintJobModule {}
