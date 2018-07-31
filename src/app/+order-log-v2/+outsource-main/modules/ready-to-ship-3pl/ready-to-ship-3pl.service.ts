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
export class ReadyToShip3plService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListReadyToShip(orderId: number,
                            styleId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v2/orders/${orderId}/styles/${styleId}/ready-to-ship`);
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            type: string,
                            model: any): Observable<ResponseMessage<any>> {
    switch (type) {
      case 'import':
        return this.http
          .put(`/api/v1/import/${orderId}/style/${styleId}/column/readytoship`, model);
      default:
        return this.http
          .put(`/api/v1/outsource/${orderId}/style/${styleId}/readytoship`, model);
    }
  }

  public getDataProjectColumn(projectId: number,
                              productId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/projects/${
        projectId}/products/${productId}/readytoship`);
  }

  public changeStatusProjectColumn(projectId: number,
                                   productId: number,
                                   model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/projects/${
          projectId}/products/${productId}/readytoship`, model);
  }
}
