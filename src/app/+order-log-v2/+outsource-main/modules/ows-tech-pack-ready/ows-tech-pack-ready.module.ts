import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  OwsTechPackReadyComponent
} from './ows-tech-pack-ready.component';

import {
  OwsTechPackReadyService
} from './ows-tech-pack-ready.service';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';

// Modules
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  UploaderTypeModule
} from '../../../../shared/modules/uploader-type';
import {
  LeadEtaModule
} from '../+shared';

// Services
import {
  StyleService
} from '../../../+sales-order/+order-styles/+styles-info/+style/style.service';

@NgModule({
  declarations: [
    OwsTechPackReadyComponent
  ],
  entryComponents: [
    OwsTechPackReadyComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    UploaderTypeModule,
    LeadEtaModule
  ],
  exports: [
    OwsTechPackReadyComponent
  ],
  providers: [
    OwsTechPackReadyService,
    StyleService
  ]
})
export class OwsTechPackReadyModule {}
