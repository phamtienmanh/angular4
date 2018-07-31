import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  AddCommentComponent
} from './add-comment.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';

// Modules
import {
  MomentModule
} from 'angular2-moment';

// Services
import {
  AddCommentService
} from './add-comment.service';

@NgModule({
  declarations: [
    AddCommentComponent
  ],
  entryComponents: [
    AddCommentComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    MomentModule
  ],
  exports: [
    AddCommentComponent
  ],
  providers: [AddCommentService]
})
export class AddCommentModule {}
