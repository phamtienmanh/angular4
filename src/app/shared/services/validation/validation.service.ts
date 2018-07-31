import {
  Injectable
} from '@angular/core';

import {
  FormGroup
} from '@angular/forms';

@Injectable()
export class ValidationService {

  public frm: any;
  public formErrors: any [];
  public validationMessages: any [];

  public buildForm(controlConfig, formErrors, validationMessages): any {
    let self = this;

    self.formErrors = formErrors;
    self.validationMessages = validationMessages;

    self.frm = new FormGroup(controlConfig);

    self.frm.valueChanges
      .subscribe((data) => self.onValueChanged(data));

    self.onValueChanged(); // (re)set validation messages now

    return self.frm;
  }

  private onValueChanged(data?: any) {
    let self = this;

    if (!self.frm) {
      return;
    }
    const form = self.frm;
    for (const field in self.formErrors) {
      if (self.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        self.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = self.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              self.formErrors[field] += messages[key] + ' ';
              break;
            }
          }
        }
      }
    }
  }
}
