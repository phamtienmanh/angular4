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
import { BasicResponse } from '../../../shared/models';

@Injectable()
export class TeamConfigService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getTeamConfig(params): Observable<BasicResponse> {
    return this.http.get(
      `/api/v1/team-config`,
      {params}
    );
  }

  public createTeamConfig(model): Observable<BasicResponse> {
    return this.http.post(
      `/api/v1/team-config`,
      JSON.stringify(model));
  }

  public updateTeamConfig(id, model): Observable<BasicResponse> {
    return this.http.put(
      `/api/v1/team-config/${id}`,
      JSON.stringify(model));
  }
}
