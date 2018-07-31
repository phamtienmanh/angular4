import {
  Routes
} from '@angular/router';

import {
  SettingsComponent
} from './settings.component';
import {
  LookupTableComponent
} from './lookup-table';

import {
  SettingsAuth
} from './settings.auth';
import {
  CustomerServiceComponent
} from './customer-service';
import {
  ScheduledTaskComponent
} from './scheduled-task';
import {
  ProcessesComponent
} from './processes/processes.component';

export const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    canActivate: [SettingsAuth],
    data: {className: 'settings'},
    children: [
      {
        path: 'approval-type',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      },
      {
        path: 'color',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      },
      {
        path: 'content',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      },
      {
        path: 'country-of-origin',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      },
      // {
      //   path: 'cut',
      //   component: CutComponent,
      //   data: {
      //     bodyClassName: 'cut'
      //   }
      // },
      // {
      //   path: 'design',
      //   component: DesignComponent,
      //   data: {
      //     bodyClassName: 'design'
      //   }
      // },
      {
        path: 'print-location',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      },
      {
        path: 'print-machine',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      },
      // {
      //   path: 'separation-type',
      //   component: LookupTableComponent,
      //   data: {
      //     bodyClassName: 'lookup-table'
      //   }
      // },
      {
        path: 'embellishment-type',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      },
      // {
      //   path: 'ship-from',
      //   component: ShipFromComponent,
      //   data: {
      //     bodyClassName: 'ship-from'
      //   }
      // },
      // {
      //   path: 'ship-via',
      //   component: ShipViaComponent,
      //   data: {
      //     bodyClassName: 'ship-via'
      //   }
      // },
      // {
      //   path: 'special',
      //   component: SpecialComponent,
      //   data: {
      //     bodyClassName: 'special'
      //   }
      // },
      {
        path: 'trim',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      },
      {
        path: 'treatment',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'treatment'
        }
      },
      {
        path: 'customer-service',
        component: CustomerServiceComponent,
        data: {
          bodyClassName: 'customer-service'
        }
      },
      {
        path: 'scheduled-tasks',
        component: ScheduledTaskComponent,
        data: {
          bodyClassName: 'scheduled-tasks'
        }
      },
      {
        path: 'finishing-process',
        component: ProcessesComponent,
        data: {
          bodyClassName: 'processes'
        }
      },
      {
        path: 'product-categories',
        loadChildren: './+category-management/category-management.module#CategoryManagementModule',
        data: {
          bodyClassName: 'product-categories'
        }
      },
      {
        path: 'product-regions',
        loadChildren: './+region-management/region-management.module#RegionManagementModule',
        data: {
          bodyClassName: 'product-regions'
        }
      },
      {
        path: 'licensors',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      },
      {
        path: 'licensees',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      },
      {
        path: 'retailer',
        component: LookupTableComponent,
        data: {
          bodyClassName: 'lookup-table'
        }
      }
    ]
  }
];
