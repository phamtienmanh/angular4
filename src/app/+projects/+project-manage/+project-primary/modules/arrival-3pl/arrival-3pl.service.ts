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
} from '../../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage,
  BasicResponse
} from '../../../../../shared/models';

@Injectable()
export class Arrival3plService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(projectId: number,
                       productId: number,
                       columnType: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/projects/${
        projectId}/products/${productId}/column/${columnType}`);
  }

  public changeStatusColumn(projectId: number,
                            productId: number,
                            columnType: number,
                            model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/projects/${
        projectId}/products/${productId}/column/${columnType}`, model);
  }
}
