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
} from '../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../shared/models';

@Injectable()
export class SchedulesPrintService {
  public curTab;

  public searchObj;
  public searchFrom;

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getLocationData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/locations`, {
      params
    });
  }

  public getSchedulesData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers`, {
      params
    });
  }

  public getLateJobData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/late-jobs`, {
      params
    });
  }

  public updateSchedulesData(schedulerId: number, model, params): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/schedulers/${schedulerId}`,
      JSON.stringify(model), {params}
    );
  }

  public updateSchedulesDetail(schedulerId: number,
                               model,
                               params): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/schedulers/${schedulerId}/detail`,
      JSON.stringify(model), {params}
    );
  }

  public addStyle2Schedule(model): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/schedulers`, JSON.stringify(model));
  }

  public reassignStyle(schedulerId: number, model, params): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/schedulers/${schedulerId}/re-assign`,
      JSON.stringify(model), {params});
  }

  public removeStyle(schedulerId: number, params): Observable<ResponseMessage<any>> {
    return this.http.delete(`/api/v1/schedulers/${schedulerId}`, {params});
  }

  public exportSchedulesData(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/schedulers/export`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  // API for scheduler page
  public getTobeScheduleData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/to-be-scheduled`, {
      params
    });
  }
  public addStyle2Scheduler(model, params): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/schedulers`, JSON.stringify(model), {params});
  }
}
