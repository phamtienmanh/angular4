import {
  Routes
} from '@angular/router';

import {
  TopPpSamplesComponent
} from './top-pp-samples.component';
import {
  Tabs
} from './top-pp-samples.model';

export const routes: Routes = [
  {
    path: '',
    component: TopPpSamplesComponent,
    data: {
      className: 'top-pp-samples'
    },
    children: [
      {
        path: '',
        redirectTo: 'all',
        pathMatch: 'full'
      },
      ...Tabs.map((t) => {
        return {
          path: t.redirectUrl,
          data: { filterType: t.filterType },
          loadChildren: './+top-pp-samples-main/top-pp-samples-main.module#TopPpSamplesMainModule'
        };
      })
    ]
  }
];
