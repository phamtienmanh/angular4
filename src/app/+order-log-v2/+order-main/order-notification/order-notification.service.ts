import {
  Injectable
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';

// Interfaces
import {
  ResponseMessage,
  BasicResponse
} from '../../../shared/models';

@Injectable()
export class OrderNotificationService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getOrder(params): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v2/orders/order-notifications`,
      {params});
  }

  public addOrder(model): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v2/orders/order-notifications`,
      JSON.stringify(model));
  }

  public updateOrder(model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v2/orders/order-notifications/${model.id}`,
      JSON.stringify(model));
  }

  public deleteOrder(id: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v2/orders/order-notifications/${id}`);
  }

  public exportOrderNotification(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/order-notifications`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }
}
