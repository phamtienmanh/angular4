import {
  Routes
} from '@angular/router';

import {
  LabelDetailComponent
} from './label-detail.component';

import {
  LabelDetailDeactive
} from './label-detail.deactive';

export const routes: Routes = [
  {
    path: '',
    component: LabelDetailComponent,
    data: {className: 'label-detail'},
    canDeactivate: [LabelDetailDeactive]
  }
];
