import {
  NgModule
} from '@angular/core';

import{
  ClickableElementDirective
} from './clickable-element.directive';

import {
  CommonElementModule
} from './../common-element';

@NgModule({
  imports: [
    CommonElementModule
  ],
  declarations: [
    ClickableElementDirective
  ],
  exports: [
    ClickableElementDirective
  ]
})
export class ClickableElementModule {
}
