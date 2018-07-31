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
} from './shipping.routes';

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
  ShippingComponent
} from './shipping.component';
import {
  UploaderTypeModule
} from '../../../../../../shared/modules/uploader-type';

// Services
import {
  ShippingService
} from './shipping.service';
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../../shared/services/validation';
import {
  ShippingDeactive
} from './shipping.deactive';

@NgModule({
  declarations: [
    ShippingComponent
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
    ShippingService,
    ValidationService,
    ShippingDeactive
  ]
})
export class ShippingModule {}
