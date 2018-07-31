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
export class NeckLabelMainService {

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getNeckLabelTabData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/neck-label`, {
      params
    });
  }

  public updateSchedulesDetail(model,
                               schedulerId: number,
                               neckLabelId: number): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams();
    if (neckLabelId) {
      params = params.set('neckLabelId', neckLabelId.toString());
    }
    return this.http.put(`/api/v1/schedulers/${schedulerId}/detail`,
      JSON.stringify(model), {params});
  }

  public exportTscNeckLabel(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/tsc-neck-label`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }
}
