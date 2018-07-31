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
export class ProjectUsersService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getProjectUsersById(projectId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/projects/${projectId}/projectuser`);
  }

  public updateProjectUsers(projectId: number, model: any): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/projects/${projectId}/projectuser`,
      JSON.stringify(model));
  }
}
