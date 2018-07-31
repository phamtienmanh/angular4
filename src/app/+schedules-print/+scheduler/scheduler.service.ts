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
} from '../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../shared/models';
import {
  HourOffset
} from '../schedules-print.model';

@Injectable()
export class SchedulerService {
  public searchObj;
  public searchFrom;

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public rearrangeSchedule (model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/schedulers/re-arrange`, JSON.stringify(model));
  }

  public reassignSchedule(schedulerId: number, model): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('utcOffset', HourOffset.toString());
    return this.http.put(`/api/v1/schedulers/${schedulerId}/re-assign`,
      JSON.stringify(model), {params});
  }

  public removeMultipleStyle(model): Observable<ResponseMessage<any>> {
    return this.http.deleteWithBody(`/api/v2/schedulers/remove`, JSON.stringify(model));
  }

  public reassignMultiToMachine(model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v2/schedulers/re-assign-to-machine`,
      JSON.stringify(model));
  }

  public reassignMultiToDate(model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v2/schedulers/re-assign-to-date`,
      JSON.stringify(model));
  }

  // handle filter data
  public convertToTsc() {
    this.searchObj.schedDateFromOnUtc = this.searchObj.dateBeginConfigOnUtc;
    this.searchObj.schedDateToOnUtc = this.searchObj.dateEndConfigOnUtc;
    this.searchObj.cancelDateFromOnUtc = this.searchObj.cancelDateFromConfigOnUtc;
    this.searchObj.cancelDateToOnUtc = this.searchObj.cancelDateToConfigOnUtc;
  }

  public convertFrFinishing() {
    this.searchObj.schedDateFromOnUtc = this.searchObj.printDateFromOnUtc;
    this.searchObj.schedDateToOnUtc = this.searchObj.printDateToOnUtc;
  }

  public convertFrNeckLabel() {
    this.searchObj.schedDateFromOnUtc = this.searchObj.neckLabelDateFromOnUtc;
    this.searchObj.schedDateToOnUtc = this.searchObj.neckLabelDateToOnUtc;
  }

  public convertFrSamples() {
    this.searchObj.printDate = this.searchObj.sampleDate || 'Next 7 Days';
    this.searchObj.schedDateFromOnUtc = this.searchObj.sampleDateFromOnUtc;
    this.searchObj.schedDateToOnUtc = this.searchObj.sampleDateToOnUtc;
  }
}
