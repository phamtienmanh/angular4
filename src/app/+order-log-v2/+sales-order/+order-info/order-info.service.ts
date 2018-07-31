import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../shared/models';
import { SalesOrderInfo } from './order-info.model';
import {
  UploadedFileModel
} from '../sales-order.model';

@Injectable()
export class OrderInfoService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public createOrder(model: SalesOrderInfo): Observable<ResponseMessage<SalesOrderInfo>> {
    return this.http.post(`/api/v1/orders`,
      JSON.stringify(model));
  }

  public updateOrderInfo(id: number,
                         model: SalesOrderInfo): Observable<ResponseMessage<SalesOrderInfo>> {
    return this.http.put(`/api/v1/orders/${id}/orderinfo`,
      JSON.stringify(model));
  }

  public uploadFileToOrder(orderId: number,
                           model: UploadedFileModel[]):
  Observable<ResponseMessage<UploadedFileModel[]>> {
    return this.http.post(`/api/v1/orderfile/update/${orderId}`,
      JSON.stringify(model));
  }

  public deleteUploadedFile(orderId: number, orderFileIds: number[]): Observable<BasicResponse> {
    return this.http.deleteWithBody(`/api/v1/orderfile?orderId=${orderId}`,
      orderFileIds);
  }

  public updateOrderFiles(orderId: number, model):
  Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/orderfile/${orderId}/order-files`,
      JSON.stringify(model));
  }
}
