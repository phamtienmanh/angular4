import {
  Routes
} from '@angular/router';

import {
  NeckLabelsComponent
} from './neck-labels.component';

export const routes: Routes = [
  {
    path: '',
    component: NeckLabelsComponent,
    data: {className: 'neck-labels'},
    children: [
      {
        path: '',
        redirectTo: 'detail',
        pathMatch: 'full'
      },
      {
        path: 'detail',
        loadChildren: '../+print-location/+label-detail/label-detail.module#LabelDetailModule'
      },
      {
        path: 'art-files',
        loadChildren: '../+print-location/+art-files/art-files.module#ArtFilesModule'
      }
    ]
  }
];
