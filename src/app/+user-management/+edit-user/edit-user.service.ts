import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';

// Interfaces
import {
  ResponseMessage,
  UserInfo
} from '../../shared/models';

@Injectable()
export class EditUserService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public updateUser(userInfo: UserInfo): Observable<ResponseMessage<UserInfo>> {
    return this.http.put(`/api/v1/account/users/${userInfo.id}`,
      JSON.stringify(userInfo));
  }

  public updateColumnsConfig(userId, model, key): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/account/users/${userId}/config`,
      JSON.stringify({
        key,
        value: model
      }));
  }

  public updateSchedulesColumnsConfig(userId, model, keyString): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/account/users/${userId}/config`,
      JSON.stringify({
        key: keyString,
        value: model
      }));
  }
}
