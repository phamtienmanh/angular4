import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  BlankGoodsComponent
} from './blank-goods.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  UploaderTypeModule
} from '../../../../shared/modules/uploader-type';
import {
  LeadEtaModule
} from '../+shared';

// Services
import {
  BlankGoodsService
} from './blank-goods.service';

@NgModule({
  declarations: [
    BlankGoodsComponent
  ],
  entryComponents: [
    BlankGoodsComponent
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
    BlankGoodsComponent
  ],
  providers: [
    BlankGoodsService
  ]
})
export class BlankGoodsModule {}
