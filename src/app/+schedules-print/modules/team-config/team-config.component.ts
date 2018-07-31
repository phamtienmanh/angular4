import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';

// Services
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../shared/services/common';
import { ValidationService } from '../../../shared/services/validation';
import { TeamConfigService } from './team-config.service';

// Validators
import {
  MinDate,
  MaxDate,
  MaxDateToday
} from '../../../shared/validators';

// Interfaces
import {
  TaskStatus
} from '../../../+order-log-v2/+order-main';
import {
  BasicGeneralInfo,
  ResponseMessage
} from '../../../shared/models';
import {
  MyDatePickerService
} from '../../../shared/services/my-date-picker';

@Component({
  selector: 'team-config',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'team-config.template.html',
  styleUrls: [
    'team-config.styles.scss'
  ]
})
export class TeamConfigComponent implements OnInit {
  @Input()
  public schedulerDate;
  @Input()
  public machineId;
  @Input()
  public isArchived;

  public staffData = {
    operator: [],
    loader: [],
    dryer: []
  };
  public newData = {
    dryer: {fullName: null},
    loader: {fullName: null},
    operator: {fullName: null}
  };
  public teamConfigId;

  public model: any = {};

  public frm: FormGroup;
  public formErrors = {
    teamColor: '',
    creditApprovedDateOnUtc: ''
  };
  public validationMessages = {
    teamColor: {
      required: 'Team color is required.'
    },
    default: {
      required: 'This is required.'
    }
  };
  public myDatePickerOptions = {
    selectorWidth: '220px',
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showClearDateBtn: true,
    alignSelectorRight: true,
    openSelectorOnInputClick: true,
    editableDateField: true,
    selectionTxtFontSize: '12px',
    height: '28px',
    firstDayOfWeek: 'su',
    sunHighlight: false,
    disableSince: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    }
  };

  public taskStatus = TaskStatus;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _teamConfigSv: TeamConfigService,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
  }

  public getTeamConfigData() {
    this.model.schedulerDate = moment(this.schedulerDate).format('YYYY-MM-DD');
    this.model.machineId = this.machineId;

    let params: HttpParams = new HttpParams()
      .set('schedulerDate', this.model.schedulerDate)
      .set('machineId', this.machineId);
    this._teamConfigSv.getTeamConfig(params)
      .subscribe((resp: any) => {
        if (resp.status) {
          if (resp.data.id) {
            this.teamConfigId = resp.data.id;
          }
          if (resp.data.teamColor === 0) {
            resp.data.teamColor = null;
          }
          resp.data = this.mappingNewData(resp.data);
          this.updateForm(resp.data);
        }
      });
  }

  public buildForm(): void {
    let controlConfig = {
      teamColor: new FormControl('', [Validators.required]),
      operatorUserId: new FormControl(''),
      newOperator: new FormControl(''),
      loaderUserId: new FormControl(''),
      newLoader: new FormControl(''),
      dryerUserId: new FormControl(''),
      newDryer: new FormControl(''),
      formRequires: new FormControl({
        teamColor: {
          required: true
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
  }

  public onValueChanged(data?: any): void {
    const form = this.frm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'creditApprovedDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.APPROVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getFactoryStaff()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          Object.keys(this.staffData).forEach((k) => {
            this.staffData[k] = [...resp.data];
          });
          this.getTeamConfigData();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Fire select value change event
   * @param value
   * @param prop
   */
  public onSelectValueChange(value: any, formProp: string, idProp: string): void {
    if (value && (!value.id || typeof value.id !== 'number') && value.fullName) {
      this.frm.get(formProp).setValue(value.fullName);
    }
    if (value && !value.id && !value.fullName) {
      this.frm.get(formProp).setValue(value);
      this.staffData[idProp] = [...this.staffData[idProp], {id: 'new-value', fullName: value}];
      this.frm.get(idProp + 'UserId').setValue('new-value');
    }
    if (!value || (value.id && typeof value.id === 'number')) {
      this.frm.get(formProp).setValue(null);
    }
  }

  public mappingNewData(data) {
    let prop = ['operator', 'loader', 'dryer'];
    prop.forEach((p) => {
      if (data[p] && !data[p + 'UserId']) {
        this.staffData[p] = [...this.staffData[p], {
          id: 'new-value',
          fullName:  data[p]
        }];
        data[p + 'UserId'] = 'new-value';
      }
    });
    return data;
  }

  public checkModelPreSubmit(model) {
    let prop = ['operator', 'loader', 'dryer'];
    let newProp = ['newOperator', 'newLoader', 'newDryer'];
    prop.forEach((p, index) => {
      if (model[p + 'UserId'] && typeof model[p + 'UserId'] !== 'number') {
        let newValue = this.staffData[p].find((s) => s.id === model[p + 'UserId']);
        model[newProp[index]] = !!newValue ? newValue.fullName : '';
        model[p + 'UserId'] = null;
      }
    });
    return model;
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public getUserById(userData, id) {
    let user = userData.find((u) => u.id === id);
    if (user) {
      return user.fullName;
    }
    return '';
  }

  public onSubmitForm(): void {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
    } else {
      this.model = {...this.model, ...this.frm.value};
      this.model = this.checkModelPreSubmit(this.model);
      if (!this.teamConfigId) {
        this._teamConfigSv.createTeamConfig(this.model)
        .subscribe((resp) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            this.activeModal.close();
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
      } else {
        this._teamConfigSv.updateTeamConfig(this.teamConfigId, this.model)
        .subscribe((resp) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            this.activeModal.close();
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
      }
    }
  }
}
