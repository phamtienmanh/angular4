import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  SettingsService
} from '../../settings.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CommonService } from '../../../shared/services/common/common.service';

// Interfaces
import {
  LookupData,
  TableType
} from '../../settings.model';
import {
  ResponseMessage
} from '../../../shared/models/respone.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'create-or-update-lookup-table',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'create-or-update-lookup-table.template.html',
  styleUrls: [
    'create-or-update-lookup-table.style.scss'
  ]
})
export class CreateOrUpdateLookupTableComponent implements OnInit,
                                                         OnDestroy {
  public title: string;
  public lookupTableInfo: LookupData;
  public lookupTableType;

  public frm: FormGroup;
  public formErrors = {
    isDisabled: '',
    name: ''
  };
  public validationMessages = {
    name: {
      required: 'Name is required.'
    }
  };

  public isEdit = false;
  public isPageReadOnly = false;

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _authService: AuthService,
              private _settingsService: SettingsService,
              private _commonService: CommonService,
              private _toastrService: ToastrService) {
    // this.isPageReadOnly = !this._authService.checkCanModify('Settings');
  }

  public ngOnInit(): void {
    this.buildForm();
    if (this.lookupTableInfo) {
      this.frm.reset();
      this.frm.patchValue({
        ...this.lookupTableInfo,
        isEnabled: !this.lookupTableInfo.isDisabled
      });
      this.isEdit = true;
    }
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      isDisabled: new FormControl({value: false, disabled: this.isPageReadOnly}),
      isEnabled: new FormControl({value: true, disabled: this.isPageReadOnly}),
      name: new FormControl({value: '', disabled: this.isPageReadOnly}, [Validators.required]),
      description: new FormControl({value: '', disabled: this.isPageReadOnly})
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  /**
   * onValueChanged
   * @param data
   */
  public onValueChanged(data?: LookupData): void {
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
   * Reset value form
   */
  public resetData(): void {
    this.buildForm();
  }

  public onSubmit() {
    setTimeout(() => {
      if (this.frm.get('name').value.trim()) {
        let model = this.frm.value;
        model.isDisabled = !model.isEnabled;
        model.type = TableType[this.lookupTableType];
        if (this.isEdit) {
          this._settingsService.updateListLookupData(model)
            .subscribe((resp: ResponseMessage<LookupData>) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.activeModal.close(true);
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
                this.activeModal.close(false);
              }
            });
        } else {
          this._settingsService.addListLookupData(model)
            .subscribe((resp: ResponseMessage<LookupData>) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.activeModal.close(true);
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
                this.activeModal.close(false);
              }
            });
        }
      } else {
        this._commonService.markAsDirtyForm(this.frm, true);
      }
    });
  }

  public ngOnDestroy(): void {
    // empty
  }
}
