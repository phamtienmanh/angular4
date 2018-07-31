import {
  AbstractControl
} from '@angular/forms';

export const MinDate = (dateFrom, dayOffset = 0) => {
  return (control: AbstractControl): { [key: string]: boolean } => {
    const dateFromControl = control.parent && control.parent.get(dateFrom);
    const dateToControl = control;
    if (!dateFromControl || !dateFromControl.value || !dateToControl || !dateToControl.value) {
      return null;
    }
    if (!dateToControl.value.includes('-') || dateToControl.value.length > 10) {
      return null;
    }
    if (dateFromControl.value.includes('-') && dateFromControl.value.length === 10) {
      return null;
    }
    const convertDateToTimestampFunc = (dateString: string): number => {
      let dateRegex = /^\d{1,2}[-/]\d{1,2}[-/](?:\d{2}|\d{4})$/;
      const dateObj = new Date(dateString);
      if (!dateRegex.test(dateString)) {
        let dateUtcObj = new Date(Date.UTC(dateObj.getFullYear(),
          dateObj.getMonth(), dateObj.getDate(),
          dateObj.getHours(), dateObj.getMinutes()));
        return dateUtcObj.setHours(0, 0, 0);
      } else {
        return dateObj.setHours(0, 0, 0);
      }
    };
    return (convertDateToTimestampFunc(dateToControl.value) + dayOffset * 24 * 60 * 60)
        <= convertDateToTimestampFunc(dateFromControl.value) ? {minDate: true} : null;
  };
};
