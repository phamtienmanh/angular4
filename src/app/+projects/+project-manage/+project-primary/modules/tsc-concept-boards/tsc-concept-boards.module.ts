import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  TscConceptBoardsComponent
} from './tsc-concept-boards.component';

import {
  TscConceptBoardsService
} from './tsc-concept-boards.service';

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
  LeadEtaModule
} from '../index';

@NgModule({
  declarations: [
    TscConceptBoardsComponent
  ],
  entryComponents: [
    TscConceptBoardsComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    TscConceptBoardsComponent
  ],
  providers: [
    TscConceptBoardsService
  ]
})
export class TscConceptBoardsModule {}
