import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { UserContext } from '../user-context';

@Injectable()
export class BearerInterceptor implements HttpInterceptor {
  constructor(private _userContext: UserContext) {
    // empty
  }

  public intercept(req: HttpRequest<any>,
                   next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this._userContext.userToken;
    if (token.accessToken) {
      const authReq = req.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`
        }
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
