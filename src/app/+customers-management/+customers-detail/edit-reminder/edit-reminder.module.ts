import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

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

// Components
import {
  EditReminderComponent
} from './edit-reminder.component';

// Services
import {
  EditReminderService
} from './edit-reminder.service';

@NgModule({
  declarations: [
    EditReminderComponent,
  ],
  imports: [
    SharedCommonModule,
    NgSelectModule,
    MyDatePickerModule,
    MomentModule
  ],
  exports: [
    EditReminderComponent
  ],
  entryComponents: [
    EditReminderComponent
  ],
  providers: [
    EditReminderService
  ]
})
export class EditReminderModule {
}
