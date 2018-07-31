import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../../../shared/models';
import {
  TechPackGeneral
} from './general.model';

@Injectable()
export class GeneralService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getGeneralInfo(orderDetailId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/owstechpack/${orderDetailId}/general`);
  }

  public updateGeneralInfo(orderDetailId: number,
                           model: TechPackGeneral): Observable<ResponseMessage<any[]>> {
    return this.http
      .put(`/api/v1/owstechpack/${orderDetailId}/general`,
      JSON.stringify(model));
  }
}
