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
export class PrintMainService {

  public machineHeaderSelect;

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getPrintTabData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/print`, {
      params
    });
  }

  public updatePrintTabData(
    schedulerId: number,
    params: HttpParams,
    model): Observable<ResponseMessage<any>> {
    return this.http.put(
      `/api/v1/schedulers/${schedulerId}/detail`,
      JSON.stringify(model), {params});
  }

  public getStyleFile(styleId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/styles/${styleId}/style-files`);
  }

  public changeStatus(schedulerId: number, type: number, isCompleted: boolean) {
    return this.http.put(
      `/api/v1/schedulers/${schedulerId}/change-status/${type}/${isCompleted}`,
      JSON.stringify({}));
  }

  public exportTscPrintData(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/tsc-print`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  public exportPrintLocationData(printLocationId, params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/printlocations/${printLocationId}/export`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }
}
