import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BearerInterceptor } from './bearer.interceptor';

export const Interceptors = [
  { useClass: BearerInterceptor, provide: HTTP_INTERCEPTORS, multi: true },
];
