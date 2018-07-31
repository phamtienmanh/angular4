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
} from './factory.routes';

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
  FactoryComponent
} from './factory.component';
import {
  UploaderTypeModule
} from '../../../../../../shared/modules/uploader-type';

// Services
import {
  FactoryService
} from './factory.service';
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../../shared/services/validation';
import {
  FactoryDeactive
} from './factory.deactive';

@NgModule({
  declarations: [
    FactoryComponent
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
    FactoryService,
    ValidationService,
    FactoryDeactive
  ]
})
export class FactoryModule {}
