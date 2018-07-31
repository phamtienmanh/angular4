import {
  Routes
} from '@angular/router';

import {
  LocationDetailComponent
} from './location-detail.component';

import {
  LocationDetailDeactive
} from './location-detail.deactive';

export const routes: Routes = [
  {
    path: '',
    component: LocationDetailComponent,
    data: {className: 'location-detail'},
    canDeactivate: [LocationDetailDeactive]
  }
];
