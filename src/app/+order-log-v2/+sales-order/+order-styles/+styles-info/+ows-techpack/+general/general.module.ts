import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  routes
} from './general.routes';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  SharedCommonModule
} from '../../../../../../shared/common';
import {
  UploaderTypeModule
} from '../../../../../../shared/modules/uploader-type';

// Components
import {
  GeneralComponent
} from './general.component';

// Services
import {
  ExtendedHttpService,
  ValidationService
} from '../../../../../../shared/services';
import {
  GeneralDeactive
} from './general.deactive';
import {
  GeneralService
} from './general.service';

@NgModule({
  declarations: [
    GeneralComponent
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
    GeneralService,
    ValidationService,
    GeneralDeactive
  ]
})
export class GeneralModule {}
