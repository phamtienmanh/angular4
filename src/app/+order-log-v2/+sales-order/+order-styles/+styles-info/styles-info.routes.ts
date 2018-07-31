import {
  Routes
} from '@angular/router';

import {
  StylesInfoComponent
} from './styles-info.component';

export const routes: Routes = [
  {
    path: '',
    component: StylesInfoComponent,
    data: {className: 'styles-info'},
    children: [
      {
        path: '',
        redirectTo: 'style',
        pathMatch: 'full'
      },
      {
        path: 'style',
        loadChildren: './+style/style.module#StyleModule'
      },
      {
        path: 'ows-techpack',
        loadChildren: './+ows-techpack/ows-techpack.module#OwsTechpackModule'
      },
      {
        path: 'tops',
        loadChildren: './+tops-v2/tops.module#TopsModule'
      },
      {
        path: 'qa',
        loadChildren: './+qa/qa.module#QaModule'
      },
      {
        path: 'samples',
        loadChildren: './+samples/sample.module#SampleModule'
      },
      {
        path: 'neck-labels',
        loadChildren: './+neck-labels/neck-labels.module#NeckLabelsModule'
      },
      {
        path: 'trims',
        loadChildren: './+trims/trims.module#TrimsModule'
      },
      {
        path: 'print-location',
        loadChildren: './+print-location/print-location.module#PrintLocationModule'
      },
      {
        path: 'shipping-info',
        loadChildren: './+shipping-info/shipping-info.module#ShippingInfoModule'
      }
    ]
  }
];
