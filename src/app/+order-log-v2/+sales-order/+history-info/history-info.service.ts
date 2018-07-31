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
import { HistoryResponse } from './history-info.model';

@Injectable()
export class HistoryInfoService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getHistoryInfo(params: HttpParams): Observable<ResponseMessage<HistoryResponse>> {
    return this.http.get(`/api/v1/orderhistories`, {
      params
    });
  }
}
