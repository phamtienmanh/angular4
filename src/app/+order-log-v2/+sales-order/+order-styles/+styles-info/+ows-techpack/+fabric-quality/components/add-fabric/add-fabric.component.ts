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
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  CommonService
} from '../../../../../../../../shared/services/common/common.service';

// Interfaces

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'add-fabric',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'add-fabric.template.html',
  styleUrls: [
    'add-fabric.style.scss'
  ],
  providers: []
})
export class AddFabricComponent implements OnInit, OnDestroy {
  public frm: FormGroup;
  public formErrors = {
    fabric: '',
    fabricConstruction: '',
    fabricWeight: ''
  };
  public validationMessages = {
    fabric: {
      required: 'Fabric is required.'
    },
    fabricConstruction: {
      required: 'Fabric Content is required.'
    },
    fabricWeight: {
      required: 'Fabric Weight is required.'
    }
  };

  constructor(public activeModal: NgbActiveModal,
              private _commonService: CommonService,
              private _fb: FormBuilder) {
    // e
  }

  public ngOnInit(): void {
    this.buildForm();
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      fabric: new FormControl(null, [Validators.required]),
      fabricConstruction: new FormControl(null, [Validators.required]),
      fabricWeight: new FormControl(null, [Validators.required]),
      formRequires: new FormControl({
        fabric: {
          required: true
        },
        fabricConstruction: {
          required: true
        },
        fabricWeight: {
          required: true
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
      this.activeModal.close({
        data: this.frm.value
      });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public ngOnDestroy(): void {
    // empty
  }
}
