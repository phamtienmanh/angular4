import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  SampleJobComponent
} from './sample-job.component';

// 3rd modules
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  ClickOutsideModule
} from 'ng-click-outside';

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
  MomentModule
} from 'angular2-moment';
import {
  DragulaModule
} from 'ng2-dragula';

// Services
import {
  SampleJobService
} from './sample-job.servive';

@NgModule({
  declarations: [
    SampleJobComponent
  ],
  entryComponents: [
    SampleJobComponent
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
    ClickOutsideModule,
    DragulaModule
  ],
  exports: [
    SampleJobComponent
  ],
  providers: [
    SampleJobService
  ]
})
export class SampleJobModule {}
