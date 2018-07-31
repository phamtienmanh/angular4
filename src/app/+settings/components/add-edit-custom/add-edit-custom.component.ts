import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  Input
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

// 3rd modules
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  CommonService
} from '../../../shared/services/common';

// Interfaces

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'add-edit-custom',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'add-edit-custom.template.html',
  styleUrls: [
    'add-edit-custom.style.scss'
  ],
  providers: []
})
export class AddEditCustomComponent implements OnInit, OnDestroy {
  @Input()
  public title: string = 'Category';
  @Input()
  public customInfo: any;

  public frm: FormGroup;
  public formErrors = {
    name: '',
    description: ''
  };
  public validationMessages = {
    name: {
      required: 'Name is required.'
    },
    description: {
      required: 'Description is required.'
    }
  };

  public isPageReadOnly = false;

  constructor(public activeModal: NgbActiveModal,
              private _commonService: CommonService,
              private _fb: FormBuilder) {
    // this.isPageReadOnly = !this._authService.checkCanModify('Settings');
  }

  public ngOnInit(): void {
    this.buildForm();
    if (this.customInfo) {
      const model = {
        ...this.customInfo,
        isEnabled: !this.customInfo.isDisabled
      };
      this.frm.patchValue(model);
    }
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      isEnabled: new FormControl(true),
      name: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }, [Validators.required]),
      description: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }),
      formRequires: new FormControl({
        name: {
          required: true
        },
        description: {
          required: false
        }
      })
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }

  /**
   * onValueChanged
   * @param data
   */
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

  public onSubmit() {
    if (this.frm.valid) {
      let model = {
        ...this.frm.value,
        isDisabled: !this.frm.get('isEnabled').value
      };
      this.activeModal.close({
        frm: model
      });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public ngOnDestroy(): void {
    // empty
  }
}
