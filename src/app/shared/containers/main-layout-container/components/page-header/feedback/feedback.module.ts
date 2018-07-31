import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../common';

import {
  FeedbackComponent
} from './feedback.component';

import {
  FeedbackService
} from './feedback.service';

// 3rd modules
import {
  NgbModalModule
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  ValidationService
} from '../../../../../services/validation/validation.service';

@NgModule({
  declarations: [
    FeedbackComponent
  ],
  entryComponents: [
    FeedbackComponent
  ],
  imports: [
    SharedCommonModule,
    NgbModalModule
  ],
  exports: [
    FeedbackComponent
  ],
  providers: [
    FeedbackService,
    ValidationService
  ]
})
export class FeedbackModule {}
