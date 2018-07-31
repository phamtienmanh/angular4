import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../../shared/models';

@Injectable()
export class TechDesignService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataImportColumn(orderId: number,
                             styleId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/import/${orderId}/sample/${styleId}`);
  }

  public changeStatusImportColumn(orderId: number,
                                  styleId: number,
                                  model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/import/${
          orderId}/sample/${styleId}/column/${model.columnId}`,
        model);
  }

  public getDataColumn(projectId: number,
                       productId: number,
                       columnType: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/projects/${
        projectId}/products/${productId}/column/${columnType}`);
  }

  public changeStatusColumn(projectId: number,
                            productId: number,
                            columnType: number,
                            model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/projects/${
          projectId}/products/${productId}/column/${columnType}`, model);
  }
}
