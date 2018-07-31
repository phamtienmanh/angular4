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
  BasicResponse,
  ResponseMessage
} from '../../../shared/models';
import {
  BasicVendor
} from '../../../+vendors-management/+vendors-edit';

@Injectable()
export class ProductInfoService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getProductById(projectId: number, productId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/projects/${projectId}/products/${productId}`);
  }

  public getStyleColor(projectId: number,
                       customerId,
                       customerPoId: string): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('customerPoId', customerPoId)
      .set('customerId', customerId);
    return this.http
      .getNoLoading(`/api/v1/projects/${projectId}/styleandcolor`,
        {params});
  }

  public getA2000Po(projectId: number,
                    params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http
      .getNoLoading(`/api/v1/projects/${projectId}/po`,
        { params });
  }

  public createProduct(projectId: number, model: any): Observable<ResponseMessage<BasicVendor>> {
    return this.http.post(`/api/v1/projects/${projectId}/products`,
      JSON.stringify(model));
  }

  public updateProduct(projectId: number,
                       productId: number,
                       model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/projects/${projectId}/products/${productId}`, model);
  }

  public deleteProduct(projectId: number, productId: number): Observable<BasicResponse> {
    return this.http
      .delete(`/api/v1/projects/${projectId}/products/${productId}`);
  }

  public archiveProduct(projectId: number, productId: number, model): Observable<BasicResponse> {
    return this.http
      .put(`/api/v1/projects/${projectId}/products/${productId}/status`, JSON.stringify(model));
  }

  public getAllFactories(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/factories?pageSize=9999`);
  }
}
