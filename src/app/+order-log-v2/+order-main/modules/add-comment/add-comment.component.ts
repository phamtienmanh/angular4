import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import { CommonService } from '../../../../shared/services/common/common.service';
import { ValidationService } from '../../../../shared/services/validation/validation.service';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker/my-date-picker.service';

// Interfaces
import {
  TaskStatus
} from '../../order-main.model';

@Component({
  selector: 'add-comment',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'add-comment.template.html',
  styleUrls: [
    'add-comment.styles.scss'
  ]
})
export class AddCommentComponent implements OnInit {
  @Input()
  public status = 0;
  @Input()
  public scheduleComments = '';
  @Input()
  public title = 'Schedule status';

  public statusData = [
    {
      id: TaskStatus.NOTAPPLICABLE,
      name: 'Not Applicable'
    },
    {
      id: TaskStatus.DONE,
      name: 'Done'
    },
    {
      id: TaskStatus.SCHEDULED,
      name: 'Scheduled'
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
    this.buildForm();
  }

  public buildForm(): void {
    let controlConfig = {
      status: new FormControl({
        value: this.status,
        disabled: true
      }),
      scheduleComments: new FormControl(this.scheduleComments),
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
