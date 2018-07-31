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
export class NeckLabelProductionService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(orderId: number,
                       styleId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/outsource/${orderId}/necklabel/${styleId}`);
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/outsource/${
        orderId}/necklabel/${styleId}/necklabelproduction`, model);
  }
}
