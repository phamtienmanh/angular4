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
} from './tops-detail.routes';

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
} from './tops-detail.component';
import {
  UploaderTypeModule
} from '../../../../../../shared/modules/uploader-type';

// Services
import {
  ShippingService
} from './tops-detail.service';
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../../shared/services/validation';
import {
  ShippingDeactive
} from './tops-detail.deactive';

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
