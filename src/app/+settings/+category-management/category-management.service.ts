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
  BasicResponse,
  ResponseMessage
} from '../../shared/models';

@Injectable()
export class CategoryManagementService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListCategory(params?: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/categories`);
  }

  public getCategory(id: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/categories/${id}`);
  }

  public createCategory(category: any): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/categories`, JSON.stringify(category));
  }

  public updateCategory(id: number, category: any): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/categories/${id}`, JSON.stringify(category));
  }

  public deleteCategory(id: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/categories/${id}`);
  }
}
