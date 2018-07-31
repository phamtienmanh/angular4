import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import { ToastrService } from 'ngx-toastr';
import { ValidationService } from '../../../shared/services/validation/validation.service';
import {
  ConfigFinishingProcessesService
} from './config-finishing-processes.service';

// Interfaces
import { BasicResponse } from '../../../shared/models/respone.model';

@Component({
  selector: 'config-finishing-processes',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'config-finishing-processes.template.html',
  styleUrls: [
    'config-finishing-processes.styles.scss'
  ]
})
export class ConfigFinishingProcessesComponent implements OnInit {
  @Input()
  public schedulerId;
  @Input()
  public processNumber;
  @Input()
  public processName;
  @Input()
  public processDetail = {
    scheduledQty: 0,
    peopleRequiredActual: null,
    staffAvgPcsPerHrActual: null,
    units: 0,
    hrsNeeded: 0,
    description: ''
  };

  public frm: FormGroup;
  public formErrors = {};
  public validationMessages = {};

  public defaultData: any = {};

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _toastrService: ToastrService,
              private _configFPService: ConfigFinishingProcessesService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this._configFPService.getConfig(this.schedulerId)
      .subscribe((resp) => {
        if (resp.status) {
          this.defaultData = resp.data;
          this.processDetail.hrsNeeded = resp.data.hrsNeeded;
          this.processDetail.units = resp.data.units;
          this.processDetail.description = resp.data.description;
          this.processDetail.peopleRequiredActual = resp.data.peopleRequired;
          this.processDetail.staffAvgPcsPerHrActual = resp.data.staffAvgPcsPerHr;
          if (!resp.data.peopleRequired) {
            this.processDetail.peopleRequiredActual = resp.data.defaultPeopleRequired;
          }
          if (!resp.data.staffAvgPcsPerHr) {
            this.processDetail.staffAvgPcsPerHrActual = resp.data.defaultStaffAvgPcsPerHr;
          }
          if (resp.data.isCustom) {
            this.frm.get('staffAvgPcsPerHrActual').disable();
          } else {
            this.frm.get('units').disable();
            this.frm.get('hrsNeeded').disable();
          }
          this.updateForm(this.processDetail);
        }
      });
  }

  public buildForm(): void {
    let controlConfig = {
      peopleRequiredActual: new FormControl('', this.validValueRange(1, 50)),
      staffAvgPcsPerHrActual: new FormControl('', this.validValueRange(1, 2000)),
      units: new FormControl('', this.validValueRange(1, 999999)),
      hrsNeeded: new FormControl('', this.validValueRange(0.01, 100)),
      description: new FormControl(''),
      formRequires: new FormControl({
        // status: {
        //   required: true
        // }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);
  }

  public validValueRange(min, max) {
    return (input: FormControl) => {
      if (input.value < min) {
        return {min: true};
      } else if (input.value > max) {
        return {max: true};
      }
      return null;
    };
  }

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
    }
  }

  public onSubmitForm(): void {
    if (this.frm.invalid) {
      return;
    }
    let model;
    if (!this.defaultData.isCustom) {
      model = {
        isCustom: false,
        peopleRequired: this.frm.value.peopleRequiredActual,
        staffAvgPcsPerHr: this.frm.value.staffAvgPcsPerHrActual,
        hrsNeeded: this.processDetail.scheduledQty /
          (this.frm.value.peopleRequiredActual * this.frm.value.staffAvgPcsPerHrActual)
      };
    } else {
      model = {
        isCustom: true,
        description: this.frm.value.description,
        units: this.frm.value.units,
        peopleRequired: this.frm.value.peopleRequiredActual,
        hrsNeeded: this.frm.value.hrsNeeded
      };
    }
    this._configFPService.configStaff(this.schedulerId, model)
      .subscribe((resp: BasicResponse) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.activeModal.close(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }
}
