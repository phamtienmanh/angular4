import {
  AbstractControl
} from '@angular/forms';

export function MaxDateToday(control: AbstractControl) {
  const dateFromControl = control;
  const todayDate = new Date(new Date().getFullYear(),
    new Date().getMonth() + 1, new Date().getDate());
  if (!dateFromControl || !dateFromControl.value) {
    return null;
  }
  if (!dateFromControl.value.includes('-') || dateFromControl.value.length > 10) {
    return null;
  }
  return new Date(dateFromControl.value).getTime() > todayDate.getTime()
    ? {maxToday: true} : null;
}
