import {
  Routes
} from '@angular/router';

import {
  OwsTechpackComponent
} from './ows-techpack.component';

export const routes: Routes = [
  {
    path: '',
    component: OwsTechpackComponent,
    data: {className: 'ows-teckpack'},
    children: [
      {
        path: '',
        redirectTo: 'general',
        pathMatch: 'full'
      },
      {
        path: 'general',
        loadChildren: './+general/general.module#GeneralModule'
      },
      {
        path: 'fabric-quality',
        loadChildren: './+fabric-quality/fabric-quality.module#FabricQualityModule'
      },
      {
        path: 'lab-dips',
        loadChildren: './+lab-dips/lab-dips.module#LabDipsModule'
      },
      {
        path: 'fit-sample',
        loadChildren: './+fit-sample/fit-sample.module#FitSampleModule'
      },
      {
        path: 'pp-sample',
        loadChildren: './+pp-sample/pp-sample.module#PpSampleModule'
      },
      {
        path: 'packing-validation',
        loadChildren: './+packing-validation/packing-validation.module#PackingValidationModule'
      }
    ]
  }
];
