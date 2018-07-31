import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  routes
} from './location-main.routes';

import {
  LocationMainComponent
} from './location-main.component';

@NgModule({
  declarations: [
    LocationMainComponent
  ],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [],
  entryComponents: []
})
export class LocationMainModule {
}
