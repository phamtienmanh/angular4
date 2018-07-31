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
} from '../../../../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../../../shared/models';
import {
  Subject
} from 'rxjs/Subject';

@Injectable()
export class PrintLocationService {
  public printLocation = {
    curLocation: '',
    dataLocationList: []
  };
  public deleteCancelled: boolean = false;
  public hasNeckLabel: boolean = false;
  private onRefresh = new Subject<string>();

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public refreshLocation(from: string): void {
    this.onRefresh.next(from);
  }

  public getRefreshLocation(): Observable<any> {
    return this.onRefresh.asObservable();
  }

  public getPrintLocationInfo(styleId: number): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('styleId', styleId.toString());
    return this.http.get(`/api/v1/printlocations`, {params});
  }

  public deletePrintLocationDetail(styleId: number, model): Observable<BasicResponse> {
    return this.http.put(`/api/v1/printlocations/${styleId}`,
      JSON.stringify(model));
  }
}
