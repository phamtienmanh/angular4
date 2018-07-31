import {
  NgModule
} from '@angular/core';

// Components
import {
  ConfirmReorderComponent
} from './confirm-reorder.component';

// Modules
import {
  SharedCommonModule
} from '../../../../../../shared/common';
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  MomentModule
} from 'angular2-moment';

// Services
import {
  ConfirmReorderService
} from './confirm-reorder.service';

@NgModule({
  declarations: [
    ConfirmReorderComponent
  ],
  entryComponents: [
    ConfirmReorderComponent
  ],
  imports: [
    SharedCommonModule,
    NgxDatatableModule,
    MomentModule
  ],
  exports: [
    ConfirmReorderComponent
  ],
  providers: [
    ConfirmReorderService
  ]
})
export class ConfirmReorderModule {}
