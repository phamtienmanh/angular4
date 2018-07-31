import {
  Routes
} from '@angular/router';

import {
  PpSampleComponent
} from './pp-sample.component';

import {
  PpSampleDeactive
} from './pp-sample.deactive';

export const routes: Routes = [
  {
    path: '',
    component: PpSampleComponent,
    data: {className: 'pp-sample'},
    canDeactivate: [PpSampleDeactive]
  }
];
