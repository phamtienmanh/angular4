import {
  Routes
} from '@angular/router';

import {
  ShippingComponent
} from './shipping.component';

import {
  ShippingDeactive
} from './shipping.deactive';

export const routes: Routes = [
  {
    path: '',
    component: ShippingComponent,
    data: {className: 'shipping'},
    canDeactivate: [ShippingDeactive]
  }
];
