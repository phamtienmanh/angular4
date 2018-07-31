import {
  NgModule
} from '@angular/core';

import{
  CommonElementDirective
} from './common-element.directive';

@NgModule({
  imports: [],
  declarations: [
    CommonElementDirective
  ],
  exports: [
    CommonElementDirective
  ]
})
export class CommonElementModule {
}
