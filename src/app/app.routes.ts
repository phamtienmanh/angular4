import {
  Routes
} from '@angular/router';
import {
  AuthGuard,
  BrowserGuard
} from './shared/services/auth-guard';
import { ResetGuard } from './shared/services/reset-guard';
import { AuthLayoutComponent } from './shared/containers/auth-layout-container';
import { MainLayoutComponent } from './shared/containers/main-layout-container';
import { NotFoundComponent } from './not-found';

export const ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // {
      //   path: '',
      //   redirectTo: 'dashboard',
      //   pathMatch: 'full'
      // },
      {
        path: 'dashboard',
        loadChildren: './+dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'user-management',
        loadChildren: './+user-management/user-management.module#UserManagementModule'
      },
      {
        path: 'reports',
        loadChildren: './+reports/reports.module#ReportsModule'
      },
      {
        path: 'factory-management',
        loadChildren: './+factory-management/factory-management.module#FactoryManagementModule'
      },
      {
        path: 'customers-management',
loadChildren: './+customers-management/customers-management.module#CustomersManagementModule'
      },
      {
        path: 'vendors-management',
        loadChildren: './+vendors-management/vendors-management.module#VendorsManagementModule'
      },
      {
        path: 'order-log-v2',
        loadChildren: './+order-log-v2/order-log.module#OrderLogModule'
      },
      {
        path: 'projects',
        loadChildren: './+projects/projects.module#ProjectsModule'
      },
      {
        path: 'artwork-view',
        loadChildren: './+artwork-view/artwork-view.module#ArtworkViewModule'
      },
      {
        path: 'role-management',
        loadChildren: './+role-management/role-management.module#RoleManagementModule'
      },
      {
        path: 'settings',
        loadChildren: './+settings/settings.module#SettingsModule'
      },
      {
        path: 'schedules-print',
        loadChildren: './+schedules-print/schedules-print.module#SchedulesPrintModule'
      }
    ]
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [BrowserGuard],
    children: [
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
      },
      {
        path: 'sign-in',
        loadChildren: './+sign-in/sign-in.module#SignInModule'
      },
      {
        path: 'change-password',
        loadChildren: './+change-password/change-password.module#ChangePasswordModule'
      },
      {
        path: 'forgot-password',
        loadChildren: './+forgot-password/forgot-password.module#ForgotPasswordModule'
      },
      {
        path: 'reset-password/:id/:code',
        loadChildren: './+reset-password/reset-password.module#ResetPasswordModule',
        canActivate: [ResetGuard]
      }
    ]
  },
  {
    path: 'not-support',
    loadChildren: './+not-support/not-support.module#NotSupportModule'
  },
  {
    path: '**',
    canActivate: [BrowserGuard],
    component: NotFoundComponent
  }
];
