import {
  Injectable
} from '@angular/core';

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
export class ProjectInfoService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public createProject(model): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/projects`,
      JSON.stringify(model));
  }

  public updateProjectInfo(id: number, model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/projects/${id}`,
      JSON.stringify(model));
  }
}
