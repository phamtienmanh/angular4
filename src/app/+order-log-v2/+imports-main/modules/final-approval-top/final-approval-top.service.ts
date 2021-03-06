import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage,
  BasicResponse
} from '../../../../shared/models';

@Injectable()
export class FinalApprovalTopService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(orderId: number,
                       styleId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/import/${orderId}/topfactory/${styleId}`);
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/import/${
          orderId}/topfactory/${styleId}/column/${model.columnId}`, model);
  }
}
