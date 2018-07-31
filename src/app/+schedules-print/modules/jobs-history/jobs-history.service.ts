import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';

@Injectable()
export class JobsHistoryService {

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getJobsHistory(id: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/jobs/${id}?isViewHistory=true`);
  }

  public getJobIssues(id: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/jobs/${id}/history-issues`);
  }
}
