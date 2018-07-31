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
export class PendingSamplesMainService {

  public searchObj;
  public searchFrom;

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getPendingSamplesTabData(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/pending-samples`, {
      params
    });
  }

  public updateSchedulesDetail(model,
                               schedulerId: number,
                               neckLabelId: number): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams();
    if (neckLabelId) {
      params = params.set('neckLabelId', neckLabelId.toString());
    }
    return this.http.put(`/api/v1/schedulers/${schedulerId}/detail`,
      JSON.stringify(model), {params});
  }

  public changeStatusColumn(columnType: number,
                            model: any,
                            sampleId: number,
                            neckLabelId: number,
                            printLocationId: number,
                            styleId?: number): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString());
    if (styleId) {
      params = params.set('styleId', styleId.toString());
    }
    if (sampleId) {
      params = params.set('sampleId', sampleId.toString());
    }
    if (neckLabelId) {
      params = params.set('neckLabelId', neckLabelId.toString());
    }
    if (printLocationId) {
      params = params.set('printLocationId', printLocationId.toString());
    }
    return this.http
      .put(`/api/v1/schedulers/pending-samples/${columnType}`, model, {params});
  }

  // handle filter data
  public convertFrTscOS() {
    this.searchObj.cancelDateFromOnUtc = this.searchObj.cancelDateFromConfigOnUtc;
    this.searchObj.cancelDateToOnUtc = this.searchObj.cancelDateToConfigOnUtc;
  }
}
