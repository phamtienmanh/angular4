import {
  Routes
} from '@angular/router';

import {
  FabricDetailComponent
} from './fabric-detail.component';

import {
  FabricDetailDeactive
} from './fabric-detail.deactive';

export const routes: Routes = [
  {
    path: '',
    component: FabricDetailComponent,
    data: {className: 'fabric-detail'},
    canDeactivate: [FabricDetailDeactive]
  }
];
