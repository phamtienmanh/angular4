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
  Factory,
  FactoryListResponse
} from './factory-management.model';
import {
  BasicResponse,
  ResponseMessage,
  BasicGeneralInfo
} from '../shared/models';

@Injectable()
export class FactoryManagementService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListFactory(params: HttpParams): Observable<ResponseMessage<FactoryListResponse>> {
    return this.http.get(`/api/v1/factories`, {
      params
    });
  }

  public getFactory(id: number): Observable<ResponseMessage<Factory>> {
    return this.http.get(`/api/v1/factories/${id}`);
  }

  public createFactory(factory: Factory): Observable<ResponseMessage<Factory>> {
    return this.http.post(`/api/v1/factories`, JSON.stringify(factory));
  }

  public updateFactory(factory: Factory): Observable<ResponseMessage<Factory>> {
    return this.http.put(`/api/v1/factories/${factory.id}`, JSON.stringify(factory));
  }

  public deleteFactory(id: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/factories/${id}`);
  }

  public getListFactoryType(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/factories/cfactorytype`);
  }
}
