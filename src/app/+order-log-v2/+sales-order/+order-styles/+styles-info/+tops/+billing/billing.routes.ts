import {
  Routes
} from '@angular/router';

import {
  BillingComponent
} from './billing.component';

import {
  BillingDeactive
} from './billing.deactive';

export const routes: Routes = [
  {
    path: '',
    component: BillingComponent,
    data: {className: 'billing'},
    canDeactivate: [BillingDeactive]
  }
];
