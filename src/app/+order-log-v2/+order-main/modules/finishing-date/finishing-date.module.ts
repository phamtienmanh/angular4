import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  FinishingDateComponent
} from './finishing-date.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules

@NgModule({
  declarations: [
    FinishingDateComponent
  ],
  entryComponents: [
    FinishingDateComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule
  ],
  exports: [
    FinishingDateComponent
  ]
})
export class FinishingDateModule {}
