import {
  Routes
} from '@angular/router';

import {
  ArtFilesComponent
} from './art-files.component';

export const routes: Routes = [
  {
    path: '',
    component: ArtFilesComponent,
    data: {className: 'art-files'}
  }
];
