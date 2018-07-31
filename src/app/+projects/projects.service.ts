import {
  Injectable
} from '@angular/core';

import {
  Response
} from '@angular/http';

// Services
import {
  ExtendedHttpService
} from '../shared/services/http';

@Injectable()
export class ProjectsService {
  public curTab;

  constructor(private http: ExtendedHttpService) {
    // empty
  }
}
