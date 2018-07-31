import {
  Injectable
} from '@angular/core';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';

// Interfaces

@Injectable()
export class FactoryDetailService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }
}
