import {
  Routes
} from '@angular/router';

import {
  QaComponent
} from './qa.component';

import {
  QaDeactive
} from './qa.deactive';

export const routes: Routes = [
  {
    path: '',
    component: QaComponent,
    data: {className: 'qa'},
    canDeactivate: [QaDeactive]
  }
];
