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
  BasicVendor,
  VendorInfo,
  VendorType
} from './vendors-edit.model';

@Injectable()
export class VendorsEditService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }
  public getVendorInfo(id: number): Observable<ResponseMessage<VendorInfo>> {
    return this.http.get(`/api/v1/vendors/${id}`);
  }

  public getVendorTypes(): Observable<ResponseMessage<VendorType[]>> {
    return this.http.get(`/api/v1/common/types`);
  }

  public createVendor(model: VendorInfo): Observable<ResponseMessage<BasicVendor>> {
    return this.http.post(`/api/v1/vendors`, JSON.stringify(model));
  }

  public updateVendor(id: number, model: VendorInfo): Observable<ResponseMessage<VendorInfo>> {
    return this.http.put(`/api/v1/vendors/${id}`, JSON.stringify(model));
  }
}
