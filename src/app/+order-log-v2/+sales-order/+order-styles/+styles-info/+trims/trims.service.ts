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
} from '../../../../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../../../shared/models';
import {
  TrimOrder
} from './trims.model';
import {
  TrimDetail
} from './+trims-detail';

@Injectable()
export class TrimsService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getStyleTrimFromStyle(styleId: number): Observable<ResponseMessage<TrimOrder>> {
    let params: HttpParams = new HttpParams()
      .set('styleId', styleId.toString());
    return this.http.get(`/api/v2/trims/styles`, {
      params
    });
  }

  public createStyleTrim(styleId: number,
                         cTrimIds: any[]): Observable<ResponseMessage<TrimDetail[]>> {
    return this.http.post(`/api/v2/trims/styles/${styleId}`,
      JSON.stringify(cTrimIds));
  }

  public updateStyleTrim(styleId: number,
                         listTrims: any[]): Observable<ResponseMessage<TrimDetail[]>> {
    return this.http.put(`/api/v2/trims/styles/${styleId}/change-qty`,
      JSON.stringify(listTrims));
  }

  public deleteTrimDetail(orderId: number,
                          styleId: number,
                          listTrimIds: number[]): Observable<BasicResponse> {
    let params: HttpParams = new HttpParams()
      .set('orderId', orderId.toString())
      .set('styleId', styleId.toString());
    return this.http.put(`/api/v2/trims`,
      JSON.stringify({listTrimIds}), {params});
  }
}
