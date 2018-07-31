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
} from '../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../shared/models';

import {
  LookupData,
  LookupDataResponse
} from './settings.model';

@Injectable()
export class SettingsService {

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListLookupData(params: HttpParams):
  Observable<ResponseMessage<LookupDataResponse>> {
    return this.http.get(`/api/v1/common/lookuptables`, {
      params
    });
  }

  public addListLookupData(lookupData: LookupData):
  Observable<ResponseMessage<LookupData>> {
    let params: HttpParams = new HttpParams()
      .set('type', lookupData.type);

    return this.http.post(`/api/v1/common/lookuptables`,
      JSON.stringify(lookupData), {params});
  }

  public updateListLookupData(lookupData: LookupData):
  Observable<ResponseMessage<LookupData>> {
    let params: HttpParams = new HttpParams()
      .set('type', lookupData.type);

    return this.http.put(`/api/v1/common/lookuptables/${lookupData.id}`,
      JSON.stringify(lookupData), {params});
  }

  public deleteLookupData(lookupData: LookupData): Observable<BasicResponse> {
    let params: HttpParams = new HttpParams()
      .set('type', lookupData.type);

    return this.http.delete(`/api/v1/common/lookuptables/${lookupData.id}`, {
      params
    });
  }
}
