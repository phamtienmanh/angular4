import {
  NgModule
} from '@angular/core';

import {
  NoisInputDirective,
  NoisInputModule
} from './nois-input';

import {
  NoisInputContainerDirective,
  NoisInputContainerModule
} from './nois-input-container';

import {
  CommonElementDirective,
  CommonElementModule
} from './common-element';

import {
  ClickableElementDirective,
  ClickableElementModule
} from './clickable-element';

export const SHARED_DIRECTIVES = [
  CommonElementDirective,
  ClickableElementDirective,
  NoisInputDirective,
  NoisInputContainerDirective
];

export const SHARED_DIRECTIVE_MODULES = [
  NoisInputModule,
  NoisInputContainerModule,
  CommonElementModule,
  ClickableElementModule

];

@NgModule({
  imports: [
    ...SHARED_DIRECTIVE_MODULES
  ],
  exports: [
    ...SHARED_DIRECTIVE_MODULES
  ],
  declarations: []
})
export class SharedDirectiveModule {
}
