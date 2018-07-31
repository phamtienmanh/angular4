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

@Injectable()
export class SamplesMainService {

  public searchObj;
  public searchFrom;

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getSamplesTabData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/samples`, {
      params
    });
  }

  public reAssignSample(printLocationId, model): Observable<ResponseMessage<any>> {
    return this.http.put(
      `/api/v1/schedulers/samples/${printLocationId}/re-assign`,
      JSON.stringify(model));
  }

  public reArrangeSample(model): Observable<ResponseMessage<any>> {
    return this.http.put(
      `/api/v1/schedulers/samples/re-arrange`,
      JSON.stringify(model));
  }

  // handle filter data
  public convertFrTsc() {
    this.searchObj.sampleDate = this.searchObj.printDate || 'Next 7 Days';
    this.searchObj.sampleDateFromOnUtc = this.searchObj.schedDateFromOnUtc;
    this.searchObj.sampleDateToOnUtc = this.searchObj.schedDateToOnUtc;
  }

  public convertFrTscOS() {
    this.searchObj.sampleDate = this.searchObj.printDate || 'Next 7 Days';
    this.searchObj.sampleDateFromOnUtc = this.searchObj.dateBeginConfigOnUtc;
    this.searchObj.sampleDateToOnUtc = this.searchObj.dateEndConfigOnUtc;
  }

  public convertFrNeckLabel() {
    this.searchObj.sampleDate = this.searchObj.printDate || 'Next 7 Days';
    this.searchObj.sampleDateFromOnUtc = this.searchObj.neckLabelDateFromOnUtc;
    this.searchObj.sampleDateToOnUtc = this.searchObj.neckLabelDateToOnUtc;
  }

  public convertFrFinishing() {
    this.searchObj.sampleDate = this.searchObj.printDate || 'Next 7 Days';
    this.searchObj.sampleDateFromOnUtc = this.searchObj.printDateFromOnUtc;
    this.searchObj.sampleDateToOnUtc = this.searchObj.printDateToOnUtc;
  }
}
