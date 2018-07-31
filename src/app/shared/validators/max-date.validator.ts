import {
  AbstractControl
} from '@angular/forms';

export const MaxDate = (dateTo, dayOffset = 0) => {
  return (control: AbstractControl): { [key: string]: boolean } => {
    const dateToControl = control.parent && control.parent.get(dateTo);
    const dateFromControl = control;
    if (!dateFromControl || !dateFromControl.value || !dateToControl || !dateToControl.value) {
      return null;
    }
    if (!dateFromControl.value.includes('-') || dateFromControl.value.length > 10) {
      return null;
    }
    if (dateToControl.value.includes('-') && dateToControl.value.length === 10) {
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
    return (convertDateToTimestampFunc(dateFromControl.value) - dayOffset * 24 * 60 * 60)
        >= convertDateToTimestampFunc(dateToControl.value) ? {maxDate: true} : null;
  };
};
