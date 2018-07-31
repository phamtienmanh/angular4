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
} from '../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../shared/models';
import {
  CustomerListResp
} from './customers-main.model';

@Injectable()
export class CustomersMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListCustomer(params: HttpParams): Observable<ResponseMessage<CustomerListResp>> {
    return this.http.get(`/api/v1/customers`, {params});
  }
}
