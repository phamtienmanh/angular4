import {
  Routes
} from '@angular/router';

import {
  ShippingInfoComponent
} from './shipping-info.component';

import {
  ShippingInfoDeactive
} from './shipping-info.deactive';

export const routes: Routes = [
  {
    path: '',
    component: ShippingInfoComponent,
    data: {className: 'shipping-info'},
    canDeactivate: [ShippingInfoDeactive]
  }
];
