import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  FolderSubmittedComponent
} from './folder-submitted.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules

@NgModule({
  declarations: [
    FolderSubmittedComponent
  ],
  entryComponents: [
    FolderSubmittedComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule
  ],
  exports: [
    FolderSubmittedComponent
  ]
})
export class FolderSubmittedModule {}
