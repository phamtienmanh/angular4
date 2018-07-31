import {
  Injectable
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  Response
} from '@angular/http';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';

// Interfaces
import {
  ResponseMessage,
  BasicResponse
} from '../../../shared/models';
import { ConfirmJobModel } from './confirm-job.model';

@Injectable()
export class ConfirmJobServive {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getConfirmDataBy(schedulerId: number): Observable<ResponseMessage<ConfirmJobModel>> {
    return this.http.get(`/api/v1/jobs/${schedulerId}`);
  }

  public moveToTomorrow(schedulerId: number, listScheduledQtys): Observable<BasicResponse> {
    return this.http.post(`/api/v1/jobs/${schedulerId}/move-to-tomorrow`,
      JSON.stringify(listScheduledQtys));
  }

  public manuallyReschedule(schedulerId: number, listScheduledQtys): Observable<BasicResponse> {
    return this.http.post(`/api/v1/jobs/${schedulerId}/manually-rescheduled`,
      JSON.stringify(listScheduledQtys));
  }

  public acceptJob(schedulerId: number,
                   model, isAcceptShortages: boolean): Observable<BasicResponse> {
    let params: HttpParams = new HttpParams()
      .set('isAcceptShortages', isAcceptShortages.toString());
    return this.http.put(`/api/v1/jobs/${schedulerId}`,
      JSON.stringify(model), {params});
  }

  public changeIncompleted(schedulerId: number,
                           isIncompleted: boolean,
                           sizeName: string): Observable<BasicResponse> {
    return this.http
      .put(`/api/v1/jobs/${schedulerId}/incompleted/${isIncompleted}`,
        JSON.stringify(sizeName));
  }
}
