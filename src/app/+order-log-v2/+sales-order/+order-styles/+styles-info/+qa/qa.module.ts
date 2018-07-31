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
} from './qa.routes';

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
} from '../../../../../shared/modules/uploader-type';

// Components
import {
  QaComponent
} from './qa.component';

// Services
import {
  QaService
} from './qa.service';
import {
  StyleService
} from '../+style/style.service';
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../shared/services/validation';
import {
  QaDeactive
} from './qa.deactive';

@NgModule({
  declarations: [
    QaComponent
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
    QaService,
    StyleService,
    QaDeactive,
    ValidationService
  ]
})
export class QaModule {}
