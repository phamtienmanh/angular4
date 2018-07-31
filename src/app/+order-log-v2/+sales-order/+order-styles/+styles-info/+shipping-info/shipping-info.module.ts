import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  routes
} from './shipping-info.routes';

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
  ShippingInfoComponent
} from './shipping-info.component';
import {
  UploaderTypeModule
} from '../../../../../shared/modules/uploader-type';

// Services
import {
  ShippingInfoService
} from './shipping-info.service';
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../shared/services/validation';
import {
  ShippingInfoDeactive
} from './shipping-info.deactive';

@NgModule({
  declarations: [
    ShippingInfoComponent
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
    ShippingInfoService,
    ValidationService,
    ShippingInfoDeactive
  ]
})
export class ShippingInfoModule {}
