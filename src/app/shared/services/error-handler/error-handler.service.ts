import {
  ErrorHandler,
  Injectable
} from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor() {
    // empty
  }

  public handleError(error) {
    alert(error.stack);
    // IMPORTANT: Rethrow the error otherwise it gets swallowed
    throw error;
  }
}
