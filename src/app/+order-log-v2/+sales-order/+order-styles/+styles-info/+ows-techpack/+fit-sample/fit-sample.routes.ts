import {
  Routes
} from '@angular/router';

import {
  FitSampleComponent
} from './fit-sample.component';

import {
  FitSampleDeactive
} from './fit-sample.deactive';

export const routes: Routes = [
  {
    path: '',
    component: FitSampleComponent,
    data: {className: 'fit-sample'},
    canDeactivate: [FitSampleDeactive]
  }
];
