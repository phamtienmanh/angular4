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
  ResponseMessage,
  UserListResponse,
  DeleteUserModel
} from '../../shared/models';
import {
  VendorListResp
} from './user-main.model';

@Injectable()
export class UserMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListUser(params: HttpParams): Observable<ResponseMessage<UserListResponse>> {
    return this.http.get(`/api/v1/account/users`, {
      params
    });
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
