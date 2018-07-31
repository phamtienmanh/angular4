import {
  Injectable
} from '@angular/core';

import {
  Response
} from '@angular/http';

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
export class CustomerServiceService {

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListTeam(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/teams`, {
      params
    });
  }

  public getListTeamById(teamId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/teams/${teamId}`);
  }

  public addTeam(team: any): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/teams`,
      JSON.stringify(team));
  }

  public updateTeam(team: any): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/teams/${team.id}`,
      JSON.stringify(team));
  }

  public deleteTeam(teamId: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/teams/${teamId}`);
  }
}
