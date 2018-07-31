import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  routes
} from './packing-validation.routes';

// 3rd modules
import {
  MomentModule
} from 'angular2-moment';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';

// Modules
import {
  SharedCommonModule
} from '../../../../../../shared/common';
import {
  UploaderTypeModule
} from '../../../../../../shared/modules/uploader-type';

// Components
import {
  PackingValidationComponent
} from './packing-validation.component';

// Services
import {
  ExtendedHttpService,
  ValidationService
} from '../../../../../../shared/services';
import {
  PackingValidationDeactive
} from './packing-validation.deactive';
import {
  PackingValidationService
} from './packing-validation.service';

@NgModule({
  declarations: [
    PackingValidationComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MomentModule,
    MyDatePickerModule,
    NgSelectModule,
    NgxDatatableModule,
    UploaderTypeModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    PackingValidationService,
    ValidationService,
    PackingValidationDeactive
  ]
})
export class PackingValidationModule {}
