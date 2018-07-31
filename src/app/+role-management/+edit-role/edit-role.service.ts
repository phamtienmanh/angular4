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
  ResponseMessage
} from '../../shared/models';
import { RoleInfo } from '../role-management.model';

@Injectable()
export class EditRoleService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public updateRole(roleInfo: RoleInfo): Observable<ResponseMessage<RoleInfo>> {
    return this.http.put(`/api/v1/rolemanagement/${roleInfo.id}`,
      JSON.stringify(roleInfo));
  }

  public getRoleInfo(id: number): Observable<ResponseMessage<RoleInfo>> {
    return this.http.get(`/api/v1/rolemanagement/${id}`);
  }
}
