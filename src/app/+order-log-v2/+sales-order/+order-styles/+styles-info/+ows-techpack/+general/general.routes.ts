import {
  Routes
} from '@angular/router';

import {
  GeneralComponent
} from './general.component';

import {
  GeneralDeactive
} from './general.deactive';

export const routes: Routes = [
  {
    path: '',
    component: GeneralComponent,
    data: {className: 'general'},
    canDeactivate: [GeneralDeactive]
  }
];
