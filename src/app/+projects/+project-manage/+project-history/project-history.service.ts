import {
  Injectable
} from '@angular/core';

import { HttpParams } from '@angular/common/http';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../shared/models';
import { HistoryResponse } from './project-history.model';

@Injectable()
export class ProjectHistoryService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getHistoryInfo(id: number,
                        params: HttpParams): Observable<ResponseMessage<HistoryResponse>> {
    return this.http.get(`/api/v1/projects/${id}/projecthistory`, {
      params
    });
  }
}
