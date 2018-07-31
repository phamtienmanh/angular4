import {
  Injectable
} from '@angular/core';
import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';
// Interfaces
import {
  ResponseMessage
} from '../../shared/models/respone.model';
import {
  BasicCustomer,
  CustomerInfo
} from './customers-edit.model';
import {
  TypeEnum
} from '../../shared/models/enums.model';

@Injectable()
export class CustomersEditService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }
  public getCustomerInfo(id: number): Observable<ResponseMessage<CustomerInfo>> {
    return this.http.get(`/api/v1/customers/${id}/type/${TypeEnum.Customer}`);
  }

  public createCustomer(model: CustomerInfo): Observable<ResponseMessage<BasicCustomer>> {
    return this.http.post(`/api/v1/customers`, JSON.stringify(model));
  }

  public updateCustomer(id: number,
                        model: CustomerInfo): Observable<ResponseMessage<CustomerInfo>> {
    return this.http.put(`/api/v1/customers/${id}`, JSON.stringify(model));
  }
}
