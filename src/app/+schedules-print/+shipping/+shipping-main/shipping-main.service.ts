import {
  Injectable
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';

@Injectable()
export class ShippingMainService {

  public searchObj;
  public searchFrom;

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getShippingTabData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/shipping`, {
      params
    });
  }

  public exportTscShipping(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/tsc-shipping`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }
}
