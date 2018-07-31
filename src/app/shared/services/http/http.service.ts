import {
  Injectable,
  Injector
} from '@angular/core';
import {
  Request,
  XHRBackend,
  RequestOptions,
  Response,
  Http,
  RequestOptionsArgs,
  Headers
} from '@angular/http';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { UserContext } from '../user-context';
import { ProgressService } from '../progress';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/finally';
import { Subject } from 'rxjs/Subject';
import { AppConstant } from '../../../app.constant';
import {
  map,
  tap
} from 'rxjs/operators';

export interface IRequestOptions {
  headers?: HttpHeaders;
  observe?: 'body' | any;
  params?: HttpParams | any;
  reportProgress?: boolean;
  responseType?: 'json' | any;
  withCredentials?: boolean;
  body?: any;
}

// https://www.illucit.com/blog/2016/03/angular2-http-authentication-interceptor/
@Injectable()
export class ExtendedHttpService {
  public httpService;
  public refreshTokenSubject: Subject<string>;

  private _httpCounter: number = 0;

  constructor(backend: XHRBackend,
              defaultOptions: RequestOptions,
              private http: HttpClient,
              private router: Router,
              private userContext: UserContext,
              private _progressService: ProgressService) {
  }

  public initParams(options: IRequestOptions): IRequestOptions {
    if (options && options.params && options.params.updates) {
      options.params.updates.forEach((p) => {
        if (p.value === null || p.value === undefined) {
          p.value = '';
        }
      });
    }
    return options;
  }

  /**
   * GET request
   * @param {string} endPoint it doesn't need / in front of the end point
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  public get<T>(endPoint: string, options?: IRequestOptions): Observable<T> {
    return this.intercept<T>(this.http
      .get<T>(AppConstant.domain + endPoint, this.initParams(options)));
  }

  /**
   * POST request
   * @param {string} endPoint end point of the api
   * @param {Object} params body of the request.
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  public post<T>(endPoint: string, params: Object, options?: IRequestOptions): Observable<T> {
    return this.intercept<T>(this.http
      .post<T>(AppConstant.domain + endPoint, params, this.initParams(options)));
  }

  /**
   * PUT request
   * @param {string} endPoint end point of the api
   * @param {Object} params body of the request.
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  public put<T>(endPoint: string, params: Object, options?: IRequestOptions): Observable<T> {
    return this.intercept<T>(this.http
      .put<T>(AppConstant.domain + endPoint, params, this.initParams(options)));
  }

  /**
   * DELETE request
   * @param {string} endPoint end point of the api
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  public delete<T>(endPoint: string, options?: IRequestOptions): Observable<T> {
    return this.intercept<T>(this.http
      .delete<T>(AppConstant.domain + endPoint, this.initParams(options)));
  }

  /**
   * GET request
   * @param {string} endPoint it doesn't need / in front of the end point
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  public getNoLoading<T>(endPoint: string, options?: IRequestOptions): Observable<T> {
    return this.intercept<T>(this.http
      .get<T>(AppConstant.domain + endPoint, this.initParams(options)), true);
  }

  public postNoLoading<T>(endPoint: string,
                          params: Object,
                          options?: IRequestOptions): Observable<T> {
    return this.intercept<T>(this.http
      .post<T>(AppConstant.domain + endPoint, params, this.initParams(options)), true);
  }

  public putNoLoading<T>(endPoint: string,
                         params: Object,
                         options?: IRequestOptions): Observable<T> {
    return this.intercept<T>(this.http
      .put<T>(AppConstant.domain + endPoint, params, this.initParams(options)), true);
  }

  public deleteWithBody<T>(endPoint: string,
                           body?: any,
                           options?: IRequestOptions): Observable<T> {
    return this.intercept<T>(this.http
      .request<T>('delete', AppConstant.domain + endPoint, {body, ...this.initParams(options)}));
  }

  public intercept<T>(observable: Observable<T>, isNoLoading = false): Observable<T> {
    if (!isNoLoading) {
      this._httpCounter++;
      if (this._httpCounter === 1) {
        this._progressService.start();
      }
    }
    return new Observable<T>((subscriber) => {
      observable.subscribe(
        (data) => {
          // subscribe
          subscriber.next(data);
        }, (err) => {
          // error
          if (err.status === 400) {
            this._progressService.done();
            subscriber.error(err.error);
            return;
          }
          if (err.status === 401) {
            if (!this.refreshTokenSubject) {
              this.refreshTokenSubject = new Subject<string>();
              this.refreshToken()
                .subscribe((token) => {
                  this.refreshTokenSubject.next(token);
                }, (error) => {
                  console.log('refresh token failed', error);
                  this.userContext.clear();
                  this.router.navigate([
                    'auth',
                    'sign-in'
                  ]);
                });
            }
            this.refreshTokenSubject.subscribe(() => {
              this.intercept(observable)
                .subscribe(
                  (data) => subscriber.next(data),
                  (error) => subscriber.error(error),
                  () => {
                    subscriber.complete();
                    this.refreshTokenSubject = null;
                  }
                );
            });
          }
          // subscriber.error(err);
        },
        () => {
          // complete
          setTimeout(() => {
            if (!isNoLoading) {
              this._httpCounter--;
              if (this._httpCounter === 0) {
                this._progressService.done();
              }
            }
          });
          subscriber.complete();
        }
      );
    });
  }

  public refreshToken() {
    const userToken = this.userContext.userToken;
    const refreshToken = userToken ? userToken.refreshToken : null;
    let data = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: AppConstant.clientId,
      client_secret: AppConstant.clientSecret
    };
    let requestPayload: string = this.transformRequestHandler(data);

    return this.http.post(`/token`, requestPayload)
      .pipe(
        map((response: any) => response),
        tap((responseData: any) => {
          this.userContext.setToken(responseData.access_token, responseData.refresh_token);
        })
      );
  }

  /**
   * transformRequestHandler
   * @param obj
   * @returns {string}
   */
  public transformRequestHandler(obj): string {
    let str: string[] = [];
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    }
    return str.join('&');
  }
}
