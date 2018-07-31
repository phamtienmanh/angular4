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
} from '../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';
import { BasicResponse } from '../../../shared/models';

@Injectable()
export class CompletePrintJobService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getProcessJob(schedulerId): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/jobprocess/${schedulerId}`);
  }

  public startSetupJob(schedulerId, params): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/jobprocess/${schedulerId}/setup`,
    JSON.stringify({}), {params});
  }

  public startPrintJob(schedulerId, params): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/jobprocess/${schedulerId}/print`,
    JSON.stringify({}), {params});
  }

  public pauseJob(schedulerId): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/jobprocess/${schedulerId}/pause`,
    JSON.stringify({}));
  }

  public resumeJob(schedulerId): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/jobprocess/${schedulerId}/resume`,
    JSON.stringify({}));
  }

  public saveJob(schedulerId, model): Observable<ResponseMessage<any>> {
    return this.http.postNoLoading(`/api/v1/jobprocess/${schedulerId}/savedraftqty`,
    JSON.stringify(model));
  }

  public setIncompleteSize(
    schedulerId, isIncompleted, model, params): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/jobs/${schedulerId}/incompleted/${isIncompleted}`,
    JSON.stringify(model), {params});
  }

  public getProcessJobIssue(schedulerId): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/jobprocess/${schedulerId}/issues`);
  }

  public addIssue(schedulerId, model): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/jobprocess/${schedulerId}/issues`,
      JSON.stringify(model));
  }

  public deleteIssue(schedulerId, issueId): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/jobprocess/${schedulerId}/issues/${issueId}`);
  }
}
