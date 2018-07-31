import {
  Injectable
} from '@angular/core';

// Services
import {
  ExtendedHttpService
} from '../shared/services/http';

@Injectable()
export class OrderLogService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }
}
