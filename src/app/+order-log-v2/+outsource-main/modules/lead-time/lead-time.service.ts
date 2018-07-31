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
export class LeadTimeService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            columnId: number,
                            type: string,
                            model: any): Observable<ResponseMessage<any>> {
    switch (type) {
      case 'import':
        return this.http
          .put(`/api/v1/import/${orderId}/style/${styleId}/revise`, model);
      case 'project':
        return this.http
          .put(`/api/v1/projects/${orderId}/products/${styleId}/column/${columnId}/revise`, model);
      default:
        return this.http
          .put(`/api/v1/outsource/${orderId}/${styleId}/${columnId}/revise`, model);
    }
  }
}
