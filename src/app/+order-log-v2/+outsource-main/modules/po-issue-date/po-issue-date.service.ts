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
  ResponseMessage
} from '../../../../shared/models';

@Injectable()
export class PoIssueDateService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(orderId: number,
                       styleId: number,
                       type: string): Observable<ResponseMessage<any>> {
    switch (type) {
      case 'import':
        return this.http
          .get(`/api/v1/import/${orderId}/style/${styleId}`);
      default:
        return this.http
          .get(`/api/v1/outsource/${orderId}/style/${styleId}`);
    }
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            type: string,
                            model: any): Observable<ResponseMessage<any>> {
    switch (type) {
      case 'import':
        return this.http
          .put(`/api/v1/import/${
            orderId}/style/${styleId}/column/${model.columnId}`, model);
      default:
        return this.http
          .put(`/api/v1/outsource/${
            orderId}/style/${styleId}/${model.columnId}`, model);
    }
  }
}
