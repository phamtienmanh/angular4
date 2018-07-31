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
export class ReadyToShipService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListReadyToShip(orderId: number, styleId?: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v2/orders/${orderId}/styles/${styleId}/ready-to-ship`);
  }
}
