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
export class EmbellishmentSampleService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(orderId: number,
                       styleId: number,
                       printLocationId: number,
                       columnId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/outsource/${
        orderId}/printlocation/${styleId}/${columnId}/${printLocationId}`);
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            printLocationId: number,
                            model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/outsource/${
          orderId}/printlocation/${styleId}/${model.columnId}/${printLocationId}`, model);
  }
}
