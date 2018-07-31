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
} from '../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../shared/models';

@Injectable()
export class ActualToShipService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getActualShipDate(orderId: number,
                           orderDetailId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v2/orders/${orderId}/${orderDetailId}/actual-ship-date`);
  }
}
