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
} from '../../../shared/models/respone.model';

@Injectable()
export class TopPpSamplesMainService {

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getTopPpSamplesTabData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/toppps`, {
      params
    });
  }

  public getQaDetail(orderDetailId): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/toppps/qa/${orderDetailId}`);
  }

  public getAccountManager(orderDetailId): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/toppps/account-manager-approval/${orderDetailId}`);
  }

  public updateAccountManager(orderDetailId, model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/toppps/account-manager-approval/${orderDetailId}`,
      JSON.stringify(model));
  }

  public updateQaDetail(orderDetailId, model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/toppps/qa/${orderDetailId}`,
      JSON.stringify(model));
  }

  public updateShipDates(model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/toppps/ship-date`,
      JSON.stringify(model));
  }

  public getShippingCarrierSv(carrierId): Observable<ResponseMessage<any>> {
    return this.http.getNoLoading(`/api/v1/shippingcarrier/${carrierId}/all`);
  }

  public createConsolidatedShipment(params): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/toppps/consolidate-shipment`,
      JSON.stringify({}), {params});
  }

  public getShipDate(topPpId): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/toppps/ship-date/${topPpId}`);
  }

  public getShippingToByName(name: string): Observable<ResponseMessage<any>> {
    return this.http.getNoLoading(`/api/v1/toppps/address/type/${3}?name=${name}`);
  }

  public exportPickTicket(orderDetailId): Observable<any> {
    return this.http.get(`/api/v1/export/pick-ticket?orderDetailId=${orderDetailId}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
