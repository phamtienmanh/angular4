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
} from '../../shared/models/respone.model';

@Injectable()
export class OutsourcePrintMainService {

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getPrintTabData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/outsource-print`, {
      params
    });
  }

  public exportOutsourcePrintData(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/outsource-print`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }
}
