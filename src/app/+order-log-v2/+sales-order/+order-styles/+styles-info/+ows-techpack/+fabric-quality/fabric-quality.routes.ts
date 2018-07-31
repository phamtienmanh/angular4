import {
  Routes
} from '@angular/router';

import {
  FabricQualityComponent
} from './fabric-quality.component';

export const routes: Routes = [
  {
    path: '',
    component: FabricQualityComponent,
    data: {className: 'fabric-quality'},
    children: [
      {
        path: ':id',
        loadChildren: './+fabric-detail/fabric-detail.module#FabricDetailModule'
      }
    ]
  }
];
