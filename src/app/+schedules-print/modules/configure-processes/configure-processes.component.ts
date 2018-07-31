import {
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  Validators,
  FormArray,
  FormBuilder
} from '@angular/forms';

import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  IMyDateModel
} from 'mydatepicker';

// Services
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../shared/services/common/common.service';
import { ValidationService } from '../../../shared/services/validation/validation.service';
import {
  ConfigureProcessesService
} from './configure-processes.service';
import _ from 'lodash';

// Validators
import {
  MinDate,
  MaxDate,
  MaxDateToday
} from '../../../shared/validators';

// Interfaces
import {
  BasicGeneralInfo,
  ResponseMessage
} from '../../../shared/models';
import {
  MyDatePickerService
} from '../../../shared/services/my-date-picker';

@Component({
  selector: 'configure-processes',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'configure-processes.template.html',
  styleUrls: [
    'configure-processes.styles.scss'
  ]
})
export class ConfigureProcessesComponent implements OnInit {
  @Input()
  public orderDetailId;

  public frm: FormArray;
  public formErrors = {};
  public validationMessages = {};
  public commentsData;

  public processList = [];
  public errors = [
    {show: false, message: 'One or more processes has not been selected'},
    {show: false, message: 'Process numbers cannot be duplicated'}
  ];
  public isSubmit = false;
  public customProcessId;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _addCmtSv: ConfigureProcessesService,
              private _fb: FormBuilder,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.getCommonData();
    this.buildForm();
  }

  public getProcessesData() {
    this._addCmtSv.getProcesses(this.orderDetailId)
    .subscribe((resp: ResponseMessage<any>) => {
      if (resp.status) {
        if (resp.data && resp.data.length) {
          this.processList = this.processList.filter((i) => !i.isDisabled
            || resp.data.some((d) => d.processId === i.id));
          this.updateForm(resp.data);
        }
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
    });
  }

  public buildForm(): void {
    this.frm = this._fb.array([]);
    this.addProcessForm();
  }

  public addProcessForm() {
    this.frm.push(this._fb.group({
      originPrId: new FormControl(null),
      processId: new FormControl(null),
      description: new FormControl(''),
      // units: new FormControl('',
      //   Validators.compose([
      //     Validators.pattern('^[1-9]([0-9]{1,5})?$')
      //   ])
      // ),
      peopleRequired: new FormControl('',
        Validators.compose([
          Validators.pattern('^[1-9]$|^([1-4][0-9])$|^50$')
        ])
      ),
      hrsNeeded: new FormControl('', this.validValueRange(0.01, 100))
    }));
  }

  public updateForm(data) {
    data.forEach((d, index) => {
      if (index > 0) {
        this.addProcessForm();
      }
      if (d.isCustom) {
        d.originPrId = d.processId;
        d.processId = this.customProcessId;
        this.frm.controls[index].get('originPrId').patchValue(d.originPrId);
        this.frm.controls[index].get('description').patchValue(d.description);
        // this.frm.controls[index].get('units').patchValue(d.units);
        this.frm.controls[index].get('peopleRequired').patchValue(d.peopleRequired);
        this.frm.controls[index].get('hrsNeeded').patchValue(d.hrsNeeded);
      }
      this.frm.controls[index].get('processId').patchValue(d.processId);
    });
  }

  public validValueRange(min, max) {
    return (input: FormControl) => {
      if (!input.value) {
        return null;
      }
      if (Number(input.value) < min) {
        return {min: true};
      } else if (Number(input.value) > max) {
        return {max: true};
      }
      return null;
    };
  }

  public getCommonData() {
    this._commonService.getProcesses()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.processList = resp.data;
          this.getProcessesData();
          this.processList.forEach((p) => {
            if (p.name === 'Custom Process') {
              this.customProcessId = p.id;
              p.displayName = p.name;
            } else {
              p.displayName = p.processNumber + ' - ' + p.name;
            }
          });
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public removeProcess(index) {
    this.frm.controls.splice(index, 1);
    this.frm.value.splice(index, 1);
    this.validateProcess();
  }

  public onSelectProcess(e, index) {
    this.validateProcess();
  }

  public validateProcess() {
    if (!this.isSubmit) {
      return;
    }
    // All dropdowns added must have a selection
    if (this.frm.value.some((p) => !p.processId && p.processId !== 0)) {
      this.errors[0].show = true;
      return false;
    } else if (this.errors[0].show) {
      this.errors[0].show = false;
    }
    // No dropdowns have the same selection
    let cloneArr = [...this.frm.value];
    let isDuplicate = false;
    cloneArr = _.sortBy(cloneArr, 'processId');
    for (let i = 0; i < cloneArr.length - 1; i++) {
      if (cloneArr[i].processId === cloneArr[i + 1].processId &&
        cloneArr[i].processId !== this.customProcessId) {
        isDuplicate = true;
      }
    }
    if (isDuplicate) {
      this.errors[1].show = true;
      return false;
    } else {
      this.errors[1].show = false;
    }
    return true;
  }

  public onSubmitForm(): void {
    this.isSubmit = true;
    if (!this.validateProcess()) {
      return;
    }
    // revert id for exist Custom Process
    let subModel = this.frm.value;
    subModel.forEach((p) => {
      if (p.originPrId) {
        p.processId = p.originPrId;
      }
    });
    this._addCmtSv.configureProcesses(this.orderDetailId, {processes: subModel})
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.activeModal.close(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }
}
