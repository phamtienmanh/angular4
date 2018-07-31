import {
  NgModule
} from '@angular/core';
import {
  MomentModule
} from 'angular2-moment';
import {
  SharedCommonModule
} from '../../../../../../shared/common';
import {
  JobChangeComponent
} from './job-change.component';
import {
   NgSelectModule
} from '@ng-select/ng-select';

@NgModule({
  declarations: [
    JobChangeComponent
  ],
  entryComponents: [
    JobChangeComponent
  ],
  imports: [
    SharedCommonModule,
    MomentModule,
    NgSelectModule
  ],
  exports: [
    JobChangeComponent
  ]
})
export class JobChangeModule {}
