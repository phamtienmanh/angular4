import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import {
  NoEmptyDirective
} from './no-empty.directive';

@NgModule({
  declarations: [
    NoEmptyDirective
  ],
  imports: [
    CommonModule // ngTemplateOutlet
  ],
  exports: [
    NoEmptyDirective
  ]
})
export class NoEmptyModule {

}
