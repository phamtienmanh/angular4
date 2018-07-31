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
export class WashProductionService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(orderId: number,
                       styleId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/outsource/${orderId}/style/${styleId}`);
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/outsource/${orderId}/style/${styleId}/${model.columnId}`, model);
  }
}
