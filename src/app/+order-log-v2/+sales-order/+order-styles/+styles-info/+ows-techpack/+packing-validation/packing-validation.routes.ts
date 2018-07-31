import {
  Routes
} from '@angular/router';

import {
  PackingValidationComponent
} from './packing-validation.component';

import {
  PackingValidationDeactive
} from './packing-validation.deactive';

export const routes: Routes = [
  {
    path: '',
    component: PackingValidationComponent,
    data: {className: 'packing-validation'},
    canDeactivate: [PackingValidationDeactive]
  }
];
