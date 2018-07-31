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
} from '../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../shared/models';

@Injectable()
export class SampleMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListSample(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/sampledevelopment`, {params});
  }

  public getCustomer(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/sampledevelopment/customer`);
  }

  public exportOrder(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/orders`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  public exportBulkPo(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/bulk-po`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  public exportA2000(): Observable<any> {
    return this.http.get(`/api/v1/export/a2000-import-errors`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  // check value of column change
  public checkValueChange(src, des, isOriginDataChange, firstCall?) {
    if (firstCall) {
      isOriginDataChange.value = false;
    }
    Object.keys(src).forEach((k) => {
      if (!src[k] && des[k]) {
        isOriginDataChange.value = true;
        // console.log(k, src[k], des[k]);
      }
      if (typeof src[k] !== 'object' && !k.includes('OnUtc')) {
        if (src[k] !== des[k]) {
          isOriginDataChange.value = true;
          // console.log(k, src[k], des[k]);
        }
      }
      if (typeof src[k] === 'string' && k.includes('OnUtc')) {
        if (src[k].slice(0, 10) !== des[k].slice(0, 10)) {
          isOriginDataChange.value = true;
          // console.log(k, src[k], des[k]);
        }
      }
      if (Array.isArray(src[k])) {
        if (src[k].length !== des[k].length) {
          isOriginDataChange.value = true;
          // console.log(k, src[k], des[k]);
        } else {
          if (typeof src[k][0] !== 'object') {
            src[k].forEach((item, index) => {
              if (src[k][index] !== des[k][index]) {
                isOriginDataChange.value = true;
                // console.log(k, src[k][index], des[k][index]);
              }
            });
          }
          if (typeof src[k][0] === 'object' && !Array.isArray(src[k][0])) {
            src[k].forEach((item, index) => {
              this.checkValueChange(src[k][index], des[k][index], isOriginDataChange);
            });
          }
        }
      }
    });
  }
}
