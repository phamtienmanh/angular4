import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../../shared/models';

@Injectable()
export class AccountManagerService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

}
