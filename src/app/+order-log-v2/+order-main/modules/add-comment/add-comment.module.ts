import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  AddCommentComponent
} from './add-comment.component';

// Modules
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    AddCommentComponent
  ],
  entryComponents: [
    AddCommentComponent
  ],
  imports: [
    SharedCommonModule,
    NgSelectModule
  ],
  exports: [
    AddCommentComponent
  ]
})
export class AddCommentModule {}
