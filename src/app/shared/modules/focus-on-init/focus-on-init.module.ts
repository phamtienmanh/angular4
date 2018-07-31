import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import {
  FocusOnInitDirective
} from './focus-on-init.directive';

@NgModule({
  declarations: [
    FocusOnInitDirective
  ],
  imports: [
    CommonModule // ngTemplateOutlet
  ],
  exports: [
    FocusOnInitDirective
  ]
})
export class FocusOnInitModule {

}
