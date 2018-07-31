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
export class PhysSampleExfactoryTopService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(orderId: number,
                       styleId: number,
                       type: string): Observable<ResponseMessage<any>> {
    switch (type) {
      case 'import':
        return this.http
          .get(`/api/v1/import/${orderId}/topfactory/${styleId}`);
      default:
        return this.http
          .get(`/api/v1/outsource/${orderId}/topfactory/${styleId}`);
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
              orderId}/topfactory/${styleId}/column/${model.columnId}`, model);
      default:
        return this.http
          .put(`/api/v1/outsource/${
              orderId}/topfactory/${styleId}/${model.columnId}`, model);
    }
  }
}
