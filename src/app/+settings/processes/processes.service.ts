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
  BasicResponse,
  ResponseMessage
} from '../../shared/models';

@Injectable()
export class ProcessesService {

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListProcess(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/finishing-processes`, {params});
  }

  public addProcess(process: any): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/finishing-processes`,
      JSON.stringify(process));
  }

  public updateProcess(process: any): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/finishing-processes/${process.id}`,
      JSON.stringify(process));
  }

  public deleteProcess(processId: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/finishing-processes/${processId}`);
  }
}
