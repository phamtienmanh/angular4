import {
  Http
} from '@angular/http';
import {
  ThemeSetting
} from './theme-setting';
import {
  AuthService
} from './auth';
import {
  ResetGuard
} from './reset-guard';
import {
  ProgressService
} from './progress';
import {
  AuthGuard,
  RoleAuthGuard,
  BrowserGuard
} from './auth-guard';
import {
  ExtendedHttpService
} from './http';
import {
  UserContext
} from './user-context';
import {
  NoisMedia
} from './nois-media';
import {
  Util
} from './util';
import {
  SignalRService
} from './signalr';
import {
  MyDatePickerService
} from './my-date-picker';
import {
  Interceptors
} from './interceptors';

export const SHARED_SERVICES = [
  ThemeSetting,
  AuthGuard,
  ResetGuard,
  AuthService,
  BrowserGuard,
  RoleAuthGuard,
  UserContext,
  ProgressService,
  NoisMedia,
  Util,
  ExtendedHttpService,
  SignalRService,
  ...Interceptors,
  MyDatePickerService
];

export * from './theme-setting';
export * from './auth';
export * from './reset-guard';
export * from './auth-guard';
export * from './progress';
export * from './http';
export * from './user-context';
export * from './nois-media';
export * from './util';
export * from './signalr';
export * from './my-date-picker';
export * from './common';
export * from './validation';
