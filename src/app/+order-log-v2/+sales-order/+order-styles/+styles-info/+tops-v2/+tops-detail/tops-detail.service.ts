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
export class ShippingService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getTopPpDetail(styleId: number, params): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/toppps/${styleId}`, {params});
  }

  // public getShippingDetail(styleId: number): Observable<ResponseMessage<any>> {
  //   return this.http.get(`/api/v1/tops/shipping/${styleId}`);
  // }

  public getApproved(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/common/topapprover`);
  }

  // public updateShippingDetail(styleId: number, model): Observable<ResponseMessage<any>> {
  //   return this.http.put(`/api/v1/tops/shipping/${styleId}`,
  //     JSON.stringify(model));
  // }

  public getShippingUser(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/common/prepared`);
  }

  public getShippingCarrierSv(carrierId): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/shippingcarrier/${carrierId}/all`);
  }

  public updateTopPpDetail(styleId: number, params, model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/toppps/${styleId}`,
      JSON.stringify(model), {params});
  }

  public getAddressByType(type: number, params): Observable<ResponseMessage<any>> {
    return this.http.getNoLoading(`/api/v1/toppps/address/type/${type}`, {params});
  }

  public getAddressList(keyword, searchByCustomerAcc): Observable<ResponseMessage<any>> {
    return this.http.getNoLoading(
      `/api/v1/toppps/address?text=${keyword}&isSerachByCustomerAccount=${searchByCustomerAcc}`
    );
  }
}
