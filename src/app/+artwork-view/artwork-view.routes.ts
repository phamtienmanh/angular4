import {
  Routes
} from '@angular/router';

import {
  ArtworkViewComponent
} from './artwork-view.component';

import {
  ArtworkViewAuth
} from './artwork-view.auth';

export const routes: Routes = [
  {
    path: '', component: ArtworkViewComponent,
    canActivate: [ArtworkViewAuth]
  }
];
