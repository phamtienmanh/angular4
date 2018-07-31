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
import {
  ValidationService,
  ExtraValidators,
  CommonService
} from '../../../../shared/services';

// Interfaces

@Component({
  selector: 'confirm-reorder',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'confirm-reorder.template.html',
  styleUrls: [
    'confirm-reorder.styles.scss'
  ]
})
export class ConfirmReorderComponent implements OnInit {
  @Input()
  public isConfirmReorder = null;
  @Input()
  public reorderComment = null;
  public frm: FormGroup;
  public formErrors = {
    creditApprovedDateOnUtc: ''
  };
  public validationMessages = {
    isConfirmReorder: {
      required: 'One option must be selected.'
    },
    reorderComment: {
      required: 'Reorder Comments is required.'
    }
  };

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService) {
  }

  public ngOnInit(): void {
    this.buildForm();
  }

  public buildForm(): void {
    let controlConfig = {
      isConfirmReorder: new FormControl(this.isConfirmReorder, [Validators.required]),
      reorderComment: new FormControl(this.reorderComment, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'reorderComment'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      formRequires: new FormControl({
        isConfirmReorder: {
          required: true
        },
        reorderComment: {
          required: false
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

  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'reorderComment') {
      let status = this.frm.get('isConfirmReorder').value === false;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else {
      return false;
    }
  }

  public onSelect(type) {
    if (this.frm.get('isConfirmReorder').value === type) {
      this.frm.get('isConfirmReorder').patchValue(null);
    } else {
      this.frm.get('isConfirmReorder').patchValue(type);
    }
    this.frm.get('isConfirmReorder').markAsDirty();
  }

  public onSubmitForm(): void {
    if (this.frm.valid) {
      this.activeModal.close({
        isConfirmReorder: this.frm.get('isConfirmReorder').value,
        reorderComment: this.frm.get('reorderComment').value
      });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
