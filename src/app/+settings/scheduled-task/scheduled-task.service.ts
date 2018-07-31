import {
  Injectable
} from '@angular/core';

import {
  Response
} from '@angular/http';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../shared/models';

@Injectable()
export class ScheduledTaskService {

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getScdtList(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/scheduletask`);
  }

  public startJob(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v2/common/hangfire/start`);
  }

  public stopJob(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v2/common/hangfire/stop`);
  }

  public updateTask(model: any): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/scheduletask/${model.id}`,
      JSON.stringify(model));
  }

  public runTask(id: any): Observable<BasicResponse> {
    return this.http.put(`/api/v1/scheduletask/${id}/run`, '');
  }
}
