import {
  Routes
} from '@angular/router';

import {
  LocationMainComponent
} from './location-main.component';

export const routes: Routes = [
  {
    path: '',
    component: LocationMainComponent,
    data: {className: 'location-main'},
    children: [
      {
        path: '',
        redirectTo: 'detail',
        pathMatch: 'full'
      },
      {
        path: 'detail',
        loadChildren: '../+location-detail/location-detail.module#LocationDetailModule'
      },
      {
        path: 'art-files',
        loadChildren: '../+art-files/art-files.module#ArtFilesModule'
      }
    ]
  }
];
