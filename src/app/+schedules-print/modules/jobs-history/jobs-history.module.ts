import {
  NgModule
} from '@angular/core';
import {
  MomentModule
} from 'angular2-moment';
import {
  SharedCommonModule
} from '../../../shared/common';
import {
  JobsHistoryComponent
} from './jobs-history.component';
import {
   JobsHistoryService
} from './jobs-history.service';

@NgModule({
  declarations: [
    JobsHistoryComponent
  ],
  entryComponents: [
    JobsHistoryComponent
  ],
  imports: [
    SharedCommonModule,
    MomentModule
  ],
  exports: [
    JobsHistoryComponent
  ],
  providers: [
    JobsHistoryService
  ]
})
export class JobsHistoryModule {}
