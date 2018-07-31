import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  CustomerPoReceiveComponent
} from './customer-po-receive.component';

import {
  CustomerPoReceiveService
} from './customer-po-receive.service';

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
    CustomerPoReceiveComponent
  ],
  entryComponents: [
    CustomerPoReceiveComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    CustomerPoReceiveComponent
  ],
  providers: [
    CustomerPoReceiveService
  ]
})
export class CustomerPoReceiveModule {}
