import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  CutTicketComponent
} from './cut-ticket.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  UploaderTypeModule
} from '../../../../shared/modules/uploader-type';

// Services

@NgModule({
  declarations: [
    CutTicketComponent
  ],
  entryComponents: [
    CutTicketComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    UploaderTypeModule
  ],
  exports: [
    CutTicketComponent
  ],
  providers: [
  ]
})
export class CutTicketModule {}
