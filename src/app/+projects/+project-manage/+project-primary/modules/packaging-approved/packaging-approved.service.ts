import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../../shared/models';

@Injectable()
export class PackagingApprovedService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(projectId: number,
                       productId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/projects/${projectId}/products/${productId}/packaging`);
  }

  public changeStatusColumn(projectId: number,
                            productId: number,
                            model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/projects/${projectId}/products/${productId}/packaging`, model);
  }
}
