import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../shared/models';

@Injectable()
export class RegionManagementService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListRegion(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/regions`);
  }

  public getRegion(id: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/regions/${id}`);
  }

  public createRegion(region: any): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/regions`, JSON.stringify(region));
  }

  public updateRegion(id: number, region: any): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/regions/${id}`, JSON.stringify(region));
  }

  public deleteRegion(id: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/regions/${id}`);
  }
}
