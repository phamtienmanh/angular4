import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

import { HttpParams } from '@angular/common/http';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../shared/models';
import {
  VendorListResp
} from './vendors-main.model';

@Injectable()
export class VendorsMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListVendor(params: HttpParams): Observable<ResponseMessage<VendorListResp>> {
    return this.http.get(`/api/v1/vendors`, {params});
  }
}
