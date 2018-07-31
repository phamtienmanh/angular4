import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  BulkUploadComponent
} from './bulk-upload.component';

import {
  BulkUploadService
} from './bulk-upload.service';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';

// Modules
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  LeadEtaModule
} from '../index';

@NgModule({
  declarations: [
    BulkUploadComponent
  ],
  entryComponents: [
    BulkUploadComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    BulkUploadComponent
  ],
  providers: [
    BulkUploadService
  ]
})
export class BulkUploadModule {}
