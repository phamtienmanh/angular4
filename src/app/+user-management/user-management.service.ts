import {
  EventEmitter,
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
} from '../shared/services/http';

// Interfaces
import {
  DeleteUserModel,
  UserInfo,
  UserListResponse,
  BasicResponse,
  ResponseMessage
} from '../shared/models';

@Injectable()
export class UserManagementService {
  public updateUserEvent = new EventEmitter<UserInfo>();
  public updatePrimaryEv = new EventEmitter<any>();

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListUser(params: HttpParams): Observable<ResponseMessage<UserListResponse>> {
    return this.http.get(`/api/v1/account/users`, {
      params
    });
  }

  public sendInvitaion(userId: number): Observable<BasicResponse> {
    return this.http.post(`/api/v1/account/send-invitation`, userId.toString());
  }

  public createUser(userInfo: UserInfo): Observable<ResponseMessage<UserInfo>> {
    return this.http.post(`/api/v1/account/users`, JSON.stringify(userInfo));
  }

  public updateUser(userInfo: UserInfo): Observable<ResponseMessage<UserInfo>> {
    return this.http.put(`/api/v1/account/users/${userInfo.id}`,
      JSON.stringify(userInfo));
  }

  public deleteMultiUser(req: DeleteUserModel): Observable<BasicResponse> {
    let params: HttpParams = new HttpParams()
      .set('isCheckedAll', req.isCheckedAll.toString())
      .set('itemsRemoved', req.itemsRemoved)
      .set('itemsChecked', req.itemsChecked)
      .set('keyword', req.keyword);

    return this.http.delete(`/api/v1/account/users/delete`, {
      params
    });
  }
}
