import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  ColumnInfoComponent
} from './column-info.component';

import {
  LabelStatusModule
} from '../label-status';

// 3rd modules
import {
  MomentModule
} from 'angular2-moment';

@NgModule({
  declarations: [
    ColumnInfoComponent
  ],
  entryComponents: [
    ColumnInfoComponent
  ],
  imports: [
    SharedCommonModule,
    LabelStatusModule,
    MomentModule
  ],
  exports: [
    ColumnInfoComponent
  ]
})
export class ColumnInfoModule {}
