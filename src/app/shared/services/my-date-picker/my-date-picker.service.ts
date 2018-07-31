import {
  Injectable
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  IMyDateModel,
  IMyInputFieldChanged,
  IMyInputFocusBlur,
  MyDatePicker
} from 'mydatepicker';

import * as moment from 'moment';

@Injectable()
export class MyDatePickerService {

  constructor() {
    // empty
  }

  /**
   * onInputFieldChanged
   * @param {IMyInputFieldChanged} event
   * @param {MyDatePicker} myDatePicker
   */
  public onInputFieldChanged(event: IMyInputFieldChanged,
                             myDatePicker: MyDatePicker) {
    let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
    let date = new Date(event.value);
    if (dateRegex.test(event.value) && date && event.value.length < 10) {
      myDatePicker.invalidDate = false;
    } else if (event.value === '') {
      myDatePicker.invalidDate = false;
    } else {
      myDatePicker.invalidDate = true;
    }
  }

  /**
   * onInputFocusBlur
   * @param {IMyInputFocusBlur} event
   * @param {MyDatePicker} myDatePicker
   * @param control
   */
  public onInputFocusBlur(event: IMyInputFocusBlur,
                          myDatePicker: MyDatePicker,
                          control?: any) {
    if (event.reason === 2) {
      const disableSince = myDatePicker.options ? myDatePicker.options.disableSince : undefined;
      const disableUntil = myDatePicker.options ? myDatePicker.options.disableUntil : undefined;
      let disableSinceDate;
      if (disableSince && disableSince.day !== 0
        && disableSince.month !== 0 && disableSince.year !== 0) {
        disableSinceDate =
          new Date(`${disableSince.month}/${disableSince.day}/${disableSince.year}`);
      }
      let disableUntilDate;
      if (disableUntil && disableUntil.day !== 0
        && disableUntil.month !== 0 && disableUntil.year !== 0) {
        disableUntilDate =
          new Date(`${disableUntil.month}/${disableUntil.day}/${disableUntil.year}`);
      }

      let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
      let dateArr = event.value.split('/');
      let date;
      if (dateArr.length === 3) {
        date = new Date(dateArr[2].length === 2 ? +`20${dateArr[2]}` : +dateArr[2],
          +dateArr[0] - 1, +dateArr[1]);
      } else {
        date = new Date(event.value);
      }

      let condition1 = !!disableSinceDate ? date.getTime() < disableSinceDate.getTime() : true;
      let condition2 = !!disableUntilDate ? date.getTime() > disableUntilDate.getTime() : true;
      if (dateRegex.test(event.value) && date && event.value.length <= 10
        && condition1 && condition2) {
        let dateConverted = moment(date).format('MM/DD/YYYY');
        if (control) {
          control.setErrors(null);
        }
        setTimeout(() => {
          myDatePicker.onUserDateInput(dateConverted);
          if (control) {
            control.patchValue(dateConverted);
          }
        });
      } else {
        let errMaxLength = false;
        let dateConverted = '';
        if (dateRegex.test(event.value)) {
          dateConverted = moment(date).format('MM-DD-YYYY');
          if (disableSince && disableSince.day !== 0
            && disableSince.month !== 0 && disableSince.year !== 0) {
            if (date.getTime() >= disableSinceDate.getTime()) {
              errMaxLength = true;
            }
          }
          if (disableUntil && disableUntil.day !== 0
            && disableUntil.month !== 0 && disableUntil.year !== 0) {
            if (date.getTime() <= disableUntilDate.getTime()) {
              errMaxLength = true;
            }
          }
        }
        if (control as FormControl && control.status) {
          control.patchValue(errMaxLength ? dateConverted :
            event.value === '' ? null : event.value);
          control.markAsDirty();
          control.markAsTouched();
          control.updateValueAndValidity();
        } else {
          control = event.value;
        }
      }
    }
  }

  /**
   * configDefaultMonth
   * @param {IMyDateModel} date
   * @param {boolean} isConfigDateFrom
   * @returns {string}
   */
  public configDefaultMonth(date: IMyDateModel, isConfigDateFrom?: boolean): string {
    if (date && date.formatted) {
      let dateConfig;
      if (isConfigDateFrom && date.epoc * 1000 < (new Date()).getTime()) {
        // if config DateFrom and chose DateTo in the pass, back a day
        dateConfig = new Date((date.epoc - 3600 * 24) * 1000);
      } else if (!isConfigDateFrom) {
        // if config DateTo, add a day
        dateConfig = new Date((date.epoc + 3600 * 24) * 1000);
      } else {
        return '';
      }
      let defaultMonth = (dateConfig.getMonth() + 1) + '/' + dateConfig.getFullYear().toString();
      if (dateConfig.getMonth() < 9) {
        // defaultMonth must be 'MM/YYYY'
        return '0' + defaultMonth;
      }
      return defaultMonth;
    }
    return '';
  }

  /**
   * addTimeToDateArray
   * @param {FormGroup} frm
   * @param {string[]} dateArr
   */
  public addTimeToDateArray(frm: FormGroup, dateArr: string[]): void {
    const currentDate = new Date();
    let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
    dateArr.forEach((date) => {
      if (frm.get(date).value) {
        let newDateTime = new Date(frm.get(date).value);
        if (!dateRegex.test(frm.get(date).value)) {
          newDateTime = new Date(Date.UTC(newDateTime.getFullYear(),
            newDateTime.getMonth(), newDateTime.getDate(),
            newDateTime.getHours(), newDateTime.getMinutes()));
        }
        newDateTime.setHours(currentDate.getHours(), currentDate.getMinutes());
        let isoDateString = newDateTime.toISOString();
        // Remove char 'Z' from model, it made 'new Date' parse utc to local date by timezone
        isoDateString = isoDateString.slice(0, isoDateString.length - 1);
        frm.get(date).patchValue(isoDateString);
      }
    });
  }

  public addUtcTimeToDateArray(frm: FormGroup, dateArr: string[]): void {
    let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
    dateArr.forEach((date) => {
      if (frm.get(date).value) {
        let currentDate = new Date(frm.get(date).value);
        if (!dateRegex.test(frm.get(date).value)) {
          return;
        }
        let newDateTime = new Date(currentDate.getFullYear(),
          currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
        newDateTime.setHours(12 + (-1 * new Date().getTimezoneOffset() / 60), 0, 0);
        let isoDateString = newDateTime.toISOString();
        // Remove char 'Z' from model, it made 'new Date' parse utc to local date by timezone
        isoDateString = isoDateString.slice(0, isoDateString.length - 1);
        frm.get(date).patchValue(isoDateString);
      }
    });
  }

  public addUtcTimeToDateModel(model): string {
    let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
    if (model) {
      let currentDate = new Date(model);
      if (!dateRegex.test(model)) {
        return model;
      }
      let newDateTime = new Date(currentDate.getFullYear(),
        currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
      newDateTime.setHours(12 + (-1 * new Date().getTimezoneOffset() / 60), 0, 0);
      let isoDateString = newDateTime.toISOString();
      // Remove char 'Z' from model, it made 'new Date' parse utc to local date by timezone
      isoDateString = isoDateString.slice(0, isoDateString.length - 1);
      return isoDateString;
    }
  }
}
