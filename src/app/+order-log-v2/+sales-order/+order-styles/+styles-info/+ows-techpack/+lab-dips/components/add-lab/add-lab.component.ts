import {
  Component,
  Input,
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

// Models
import {
  ResponseMessage
} from '../../../../../../../../shared/models/respone.model';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService
} from '../../../../../../../../shared/services/common/common.service';
import {
  FabricQualityService
} from '../../../+fabric-quality/fabric-quality.service';

// Interfaces

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'add-lap',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'add-lab.template.html',
  styleUrls: [
    'add-lab.style.scss'
  ],
  providers: [FabricQualityService]
})
export class AddLabComponent implements OnInit, OnDestroy {
  @Input()
  public styleId: number;
  public frm: FormGroup;
  public formErrors = {
    fabricQualityIds: '',
    color: ''
  };
  public validationMessages = {
    fabricQualityIds: {
      required: 'Specify at least one Fabric.'
    },
    color: {
      required: 'Color is required.'
    }
  };
  public fabricList = [];

  constructor(public activeModal: NgbActiveModal,
              private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _fabricQualityService: FabricQualityService,
              private _fb: FormBuilder) {
    // e
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getFabricList();
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      fabricQualityIds: new FormControl(null, [Validators.required]),
      color: new FormControl(null, [Validators.required]),
      formRequires: new FormControl({
        fabricQualityIds: {
          required: true
        },
        color: {
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

  public getFabricList(): void {
    this._fabricQualityService.getFabricList(this.styleId)
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          this.fabricList = resp.data;
          if (this.fabricList && this.fabricList.length === 1) {
            this.frm.get('fabricQualityIds').patchValue([this.fabricList[0].id]);
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
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
