import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../../../../shared/common';

import {
  routes
} from './billing.routes';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules

// Components
import {
  BillingComponent
} from './billing.component';
import {
  UploaderTypeModule
} from '../../../../../../shared/modules/uploader-type';

// Services
import {
  BillingService
} from './billing.service';
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../../shared/services/validation';
import {
  BillingDeactive
} from './billing.deactive';

@NgModule({
  declarations: [
    BillingComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    UploaderTypeModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    BillingService,
    ValidationService,
    BillingDeactive
  ]
})
export class BillingModule {}
