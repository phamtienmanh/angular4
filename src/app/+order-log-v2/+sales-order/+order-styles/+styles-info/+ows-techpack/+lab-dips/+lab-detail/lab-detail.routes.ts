import {
  Routes
} from '@angular/router';

import {
  LabDetailComponent
} from './lab-detail.component';

import {
  LabDetailDeactive
} from './lab-detail.deactive';

export const routes: Routes = [
  {
    path: '',
    component: LabDetailComponent,
    data: {className: 'lab-detail'},
    canDeactivate: [LabDetailDeactive]
  }
];
