import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmDialogComponent } from './confirm-dialog.component';

@NgModule({
  declarations: [
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule, // ngTemplateOutlet
    NgbModule
  ],
  entryComponents: [
    ConfirmDialogComponent
  ],
  exports: [
    ConfirmDialogComponent,
  ],
})
export class ConfirmDialogModule {

}
