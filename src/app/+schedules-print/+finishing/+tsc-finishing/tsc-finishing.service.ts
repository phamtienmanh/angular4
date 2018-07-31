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
export class TscFinishingService {

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getFinishingData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/finishing`, {
      params
    });
  }

  public updateFinishingData(schedulerId: number, params: HttpParams, model):
    Observable<ResponseMessage<any>> {
    return this.http.put(
      `/api/v1/schedulers/${schedulerId}/detail`,
      JSON.stringify(model), {params});
  }

  public getStyleFile(styleId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/styles/${styleId}/style-files`);
  }

  public exportFinishingData(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/finishing`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }
}
