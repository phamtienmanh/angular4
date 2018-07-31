import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../shared/models';

@Injectable()
export class PhysSampleApprovedService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(orderId: number,
                       styleId: number,
                       type: string): Observable<ResponseMessage<any>> {
    switch (type) {
      case 'import':
        return this.http
          .get(`/api/v1/import/${orderId}/sample/${styleId}`);
      default:
        return this.http
          .get(`/api/v1/outsource/${orderId}/sample/${styleId}`);
    }
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            type: string,
                            model: any): Observable<ResponseMessage<any>> {
    switch (type) {
      case 'import':
        return this.http
          .put(`/api/v1/import/${
              orderId}/sample/${styleId}/column/${model.columnId}`, model);
      default:
        return this.http
          .put(`/api/v1/outsource/${
            orderId}/sample/${styleId}/${model.columnId}`, model);
    }
  }

  public getDataProjectColumn(projectId: number,
                              productId: number,
                              columnType: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/projects/${
        projectId}/products/${productId}/column/${columnType}`);
  }

  public changeStatusProjectColumn(projectId: number,
                                   productId: number,
                                   columnType: number,
                                   model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/projects/${
          projectId}/products/${productId}/column/${columnType}`, model);
  }
}
