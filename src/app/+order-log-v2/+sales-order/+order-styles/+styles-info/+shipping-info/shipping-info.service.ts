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
import { SalesShippingInfo } from './shipping-info.model';

@Injectable()
export class ShippingInfoService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getShippingInfo(orderId: number,
                         orderDetailId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v2/orders/${orderId}/${orderDetailId}/actual-ship-date`);
  }

  public updateShippingInfo(orderId: number,
                            orderDetailId: number,
                            model: SalesShippingInfo): Observable<ResponseMessage<any[]>> {
    return this.http
      .put(`/api/v1/styles/${orderId}/${orderDetailId}/actual-ship-date`,
      JSON.stringify(model));
  }
}
