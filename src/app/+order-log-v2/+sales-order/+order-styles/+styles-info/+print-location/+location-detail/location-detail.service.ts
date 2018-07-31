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
} from '../../../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../../../shared/models';
import {
  PrintLocationInfo
} from './location-detail.model';

@Injectable()
export class LocationDetailService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getPrintLocationById(id: number, styleId: number): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('styleId', styleId.toString());
    return this.http.get(`/api/v1/printlocations/${id}`, {params});
  }

  public addPrintLocationDetail(styleId: number, locationIds):
  Observable<ResponseMessage<PrintLocationInfo>> {
    let params: HttpParams = new HttpParams()
      .set('styleId', styleId.toString());
    return this.http.post(`/api/v1/printlocations`,
      JSON.stringify(locationIds), {params});
  }

  public updatePrintLocationById(model: any): Observable<ResponseMessage<PrintLocationInfo>> {
    let params: HttpParams = new HttpParams()
      .set('styleId', model.styleId)
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString());
    return this.http.put(`/api/v1/printlocations/${model.id}`,
      JSON.stringify(model), {params});
  }

  public getArtFiles(params: HttpParams, isNeckLabel?: boolean):
  Observable<ResponseMessage<any>> {
    let url = '/api/v1/artfiles';
    if (isNeckLabel) {
      url = '/api/v1/neck-labels';
    }
    return this.http.get(`${url}`, {
      params
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
