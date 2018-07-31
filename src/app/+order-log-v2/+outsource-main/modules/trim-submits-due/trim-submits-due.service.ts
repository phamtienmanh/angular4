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
export class TrimSubmitsDueService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListTrimETA(orderId: number, styleId?: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v2/orders/${orderId}/trim-eta/${styleId}`);
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            type: string,
                            model: any): Observable<ResponseMessage<any>> {
    switch (type) {
      case 'import':
        return this.http
          .put(`/api/v1/import/${orderId}/trim-eta/${styleId}`, model);
      default:
        return this.http
          .put(`/api/v1/outsource/${
            orderId}/trimeta/${styleId}/${model.columnId}`, model);
    }
  }
}
