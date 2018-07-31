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
  ProductListResp
} from './products-main.model';

@Injectable()
export class ProductsMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListProduct(params: HttpParams): Observable<ResponseMessage<ProductListResp>> {
    return this.http.get(`/api/v1/projects/products`, {
      params
    });
  }

  public exportProducts(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/products`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }
}
