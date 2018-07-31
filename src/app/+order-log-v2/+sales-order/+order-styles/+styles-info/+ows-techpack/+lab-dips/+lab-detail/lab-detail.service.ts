import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../../../../shared/models';
import {
  LabDetail
} from './lab-detail.model';

@Injectable()
export class LabDetailService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getLabInfo(styleId: number, labId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/owstechpack/${styleId}/lab-dip/${labId}`);
  }

  public updateLabInfo(styleId: number, labId: number, type: number,
                       model: LabDetail): Observable<ResponseMessage<any[]>> {
    return this.http.put(`/api/v1/owstechpack/${styleId}/lab-dip/${labId}?submitType=${type}`,
      JSON.stringify(model));
  }
}
