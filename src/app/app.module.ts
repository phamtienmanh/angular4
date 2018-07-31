import {
  NgModule,
  ErrorHandler
} from '@angular/core';

import {
  BrowserModule
} from '@angular/platform-browser';

import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';

import {
  PushNotificationsModule,
} from 'angular2-notifications';
import {
  RouterModule,
  RouteReuseStrategy,
  PreloadAllModules
} from '@angular/router';

import { HttpClientModule } from '@angular/common/http';

import {
  CustomReuseStrategy,
  RouterService
} from './core/router';

import { SignalRModule, SignalRConfiguration } from 'ng2-signalr';
import { NgIdleModule } from '@ng-idle/core';

import { AppConstant } from './app.constant';

export function createConfig(): SignalRConfiguration {
  const c = new SignalRConfiguration();
  c.hubName = 'messageHub';
  c.url = AppConstant.domain;
  return c;
}

import {
  SharedCommonModule,
  ROOT_MODULES
} from './shared/common';

import {
  SHARED_SERVICES,
  SHARED_MODULES,
  SHARED_PIPES
} from './shared';

import {
  ENV_PROVIDERS
} from './environment';

import {
  ROUTES
} from './app.routes';

// App is our top level component
import {
  AppComponent
} from './app.component';

import {
  MainLayoutModule
} from './shared/containers/main-layout-container';

import {
  NotFoundModule
} from './not-found';

import {
  AuthLayoutModule
} from './shared/containers/auth-layout-container';

import {
  ImgZoomClickService
} from '../app/shared/modules/img-zoom-click';

import {
  GlobalErrorHandler
} from './shared/services/error-handler';

// Application wide
const APP_PROVIDERS = [
  ...SHARED_SERVICES,
  { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  RouterService
];

const APP_DECLARATION = [
  AppComponent
];

// App Styles
import '../styles/styles.scss';

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [
    AppComponent
  ],
  declarations: APP_DECLARATION,
  imports: [ // import Angular's modules
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES),
    SignalRModule.forRoot(createConfig),
    NgIdleModule.forRoot(),
    ...ROOT_MODULES,

    MainLayoutModule,
    AuthLayoutModule,

    NotFoundModule,

    PushNotificationsModule,
    ...SHARED_MODULES
  ],
  exports: [ // Exports module to make it available in another modules
    BrowserModule,
    BrowserAnimationsModule,
    SignalRModule,
    RouterModule,
    SharedCommonModule,

    MainLayoutModule,
    AuthLayoutModule,

    ...APP_DECLARATION,
    ...SHARED_MODULES
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS,
    ImgZoomClickService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
})
export class AppModule {
}
