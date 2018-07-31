import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

import {
  HttpParams
} from '@angular/common/http';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';
// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';
import {
  SalesOrderListResp
} from './customers-sales-order.model';
@Injectable()
export class CustomersSalesOrderService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListSalesOrder(id: number,
                           params: HttpParams):
  Observable<ResponseMessage<SalesOrderListResp>> {
    return this.http.get(`/api/v1/customers/${id}/salesorder`, {params});
  }
}
