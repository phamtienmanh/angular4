import {
  Injectable
} from '@angular/core';

import {
  Response
} from '@angular/http';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';

// Interfaces
import {
  ResponseMessage,
  BasicResponse
} from '../../shared/models';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class ProjectMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListCustomer(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/projects/customer`);
  }

  public getListProject(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/projects`, {
      params
    });
  }

  public deleteProject(id: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/projects/${id}`);
  }
}
