import {
  Routes
} from '@angular/router';

import {
  TrimsDetailComponent
} from './trims-detail.component';

import {
  TrimsDetailDeactive
} from './trims-detail.deactive';

export const routes: Routes = [
  {
    path: '',
    component: TrimsDetailComponent,
    data: {className: 'trims-detail'},
    canDeactivate: [TrimsDetailDeactive]
  }
];
