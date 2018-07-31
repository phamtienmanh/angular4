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
export class TrimEtaService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListTrimETA(orderId: number, styleId?: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v2/orders/${orderId}/trim-eta/${styleId}`);
  }
}
