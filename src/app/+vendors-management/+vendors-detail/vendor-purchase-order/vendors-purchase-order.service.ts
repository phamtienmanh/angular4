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
  ResponseMessage
} from '../../../shared/models';

import {
  PurchaseOrderListResp
} from './vendor-purchase-order.model';

@Injectable()
export class VendorsPurchaseOrderService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListVendorPurchaseOrder(id: number, params: HttpParams):
  Observable<ResponseMessage<PurchaseOrderListResp>> {
    return this.http.get(`/api/v1/vendors/${id}/purchaseorder`, {params});
  }
}
