import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

import {
  HttpParams
} from '@angular/common/http';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage,
  DeleteUserModel
} from '../../shared/models';

@Injectable()
export class RoleMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListRoles(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/rolemanagement`, {
      params
    });
  }

  public deleteMultiRole(req: DeleteUserModel): Observable<BasicResponse> {
    let params: HttpParams = new HttpParams()
      .set('isCheckedAll', req.isCheckedAll.toString())
      .set('itemsRemoved', req.itemsRemoved)
      .set('itemsChecked', req.itemsChecked)
      .set('keyword', req.keyword);

    return this.http.delete(`/api/v1/rolemanagement`, {
      params
    });
  }
}
