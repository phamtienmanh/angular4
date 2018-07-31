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
export class ArtReleasedService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(orderId: number,
                       styleId: number,
                       printLocationId: number,
                       type: string,
                       columnId: number): Observable<ResponseMessage<any>> {
    switch (type) {
      case 'import':
        return this.http
          .get(`/api/v1/import/${
            orderId}/style/${styleId}/printlocation/${printLocationId}`);
      default:
        return this.http
          .get(`/api/v1/outsource/${
            orderId}/printlocation/${styleId}/${columnId}/${printLocationId}`);
    }
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            printLocationId: number,
                            type: string,
                            model: any): Observable<ResponseMessage<any>> {
    switch (type) {
      case 'import':
        return this.http
          .put(`/api/v1/import/${
              orderId}/style/${styleId}/printlocation/${printLocationId}/column/${model.columnId}`,
            model);
      default:
        return this.http
          .put(`/api/v1/outsource/${
              orderId}/printlocation/${styleId}/${model.columnId}/${printLocationId}`,
            model);
    }
  }
}
