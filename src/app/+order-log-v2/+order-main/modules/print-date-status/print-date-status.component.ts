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
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';

// Interfaces
import {
  TaskStatus
} from '../../order-main.model';
import { Columns } from '../columns.model';

@Component({
  selector: 'print-date-status',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'print-date-status.template.html',
  styleUrls: [
    'print-date-status.styles.scss'
  ]
})
export class PrintDateStatusComponent implements OnInit {
  @Input()
  public type = Columns.Schedule;
  @Input()
  public status = 0;
  public title = 'Schedule status';

  public statusData = [
    {
      id: TaskStatus.OK,
      name: 'Sched OK'
    },
    {
      id: TaskStatus.ISSUE,
      name: 'Sched Issue'
    },
    {
      id: TaskStatus.TBD,
      name: 'Sched TBD'
    }
  ];

  public frm: FormGroup;
  public formErrors = {};
  public validationMessages = {
    default: {
      required: 'This is required.'
    }
  };

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    if (this.type === Columns.Shipping) {
      this.title = 'Shipping status';
      this.statusData = [
        {
          id: TaskStatus.OK,
          name: 'Ship OK'
        },
        {
          id: TaskStatus.ISSUE,
          name: 'Ship Issue'
        },
        {
          id: TaskStatus.TBD,
          name: 'Ship TBD'
        }
      ];
    }
    this.buildForm();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      status: new FormControl(this.status, [Validators.required]),
      formRequires: new FormControl({
        status: {
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

  public onSubmitForm(): void {
    if (!this.frm.invalid) {
      this.activeModal.close(this.frm.value);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
