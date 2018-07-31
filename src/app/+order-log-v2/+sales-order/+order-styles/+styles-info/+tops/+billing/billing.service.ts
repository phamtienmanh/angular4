import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../../../shared/models';

@Injectable()
export class BillingService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getBillingDetail(styleId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/tops/billing/${styleId}`);
  }

  public updateBillingDetail(styleId: number, model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/tops/billing/${styleId}`,
      JSON.stringify(model));
  }
}
