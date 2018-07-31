import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../shared/models';

@Injectable()
export class DashboardService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListReport(ids: string,
                       isRemoveCache: boolean = false): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/dashboard/reports?reportIds=${ids}&isRemoveCache=${isRemoveCache}`);
  }
}
