import {
  Routes
} from '@angular/router';

import {
  SampleComponent
} from './sample.component';

import {
  SampleDeactive
} from './sample.deactive';

export const routes: Routes = [
  {
    path: '',
    component: SampleComponent,
    data: {className: 'sample'},
    canDeactivate: [SampleDeactive]
  }
];
