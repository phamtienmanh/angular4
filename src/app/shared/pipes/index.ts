import {
  NgModule
} from '@angular/core';

import {
  KeysPipe
} from './keys';
import {
  HrsToHrsMinPipe
} from './hrsToHrsMin';

export const SHARED_PIPES = [
  KeysPipe,
  HrsToHrsMinPipe
];

@NgModule({
  declarations: [
    ...SHARED_PIPES
  ],
  exports: [
    ...SHARED_PIPES
  ]
})
export class SharedPipeModule {
}
