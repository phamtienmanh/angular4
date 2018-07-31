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
  RuntimeService
} from './runtime.service';

// Interfaces
import { BasicResponse } from '../../../shared/models/respone.model';

@Component({
  selector: 'runtime',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'runtime.template.html',
  styleUrls: [
    'runtime.styles.scss'
  ]
})
export class RuntimeComponent implements OnInit {
  @Input()
  public schedulerId;
  @Input()
  public runtimeDetail = {
    scheduledQty: 0,
    avgPcsPerHrDefaults: 0,
    avgPcsPerHrEstimated: 0,
  };

  public frm: FormGroup;
  public formErrors = {};
  public validationMessages = {};

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _toastrService: ToastrService,
              private _runtimeService: RuntimeService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.updateForm(this.runtimeDetail);
  }

  public buildForm(): void {
    let controlConfig = {
      avgPcsPerHrDefaults: new FormControl(''),
      avgPcsPerHrEstimated: new FormControl('', this.validValueRange(1, 2000)),
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
    this._runtimeService.configRunTime(this.schedulerId, this.frm.value)
      .subscribe((resp: BasicResponse) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.activeModal.close({
            status: true,
            frm: this.frm.value
          });
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }
}
