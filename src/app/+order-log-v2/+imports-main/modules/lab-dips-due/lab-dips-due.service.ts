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
export class LabDipsDueService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getDataColumn(orderId: number,
                       styleId: number,
                       fabricQualityId: number,
                       labDipId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/import/${orderId}/style/${
        styleId}/fabric-quality/${fabricQualityId}/lab-dip/${labDipId}`);
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            fabricQualityId: number,
                            labDipId: number,
                            model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/import/${orderId}/style/${
          styleId}/fabric-quality/${fabricQualityId}/lab-dip/${labDipId}`, model);
  }
}
