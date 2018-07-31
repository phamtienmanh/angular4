import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  LocationDetailService
} from '../../+location-detail/location-detail.service';
import {
  ToastrService
} from 'ngx-toastr';
import {
  PrintLocationService
} from '../../print-location.service';
import {
  SalesOrderService
} from '../../../../../sales-order.service';

// Component
import {
  ConfirmDialogComponent
} from '../../../../../../../shared/modules/confirm-dialog';

// Interface
import {
  ResponseMessage
} from '../../../../../../../shared/models/respone.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'select-location',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'select-location.template.html',
  styleUrls: []
})
export class SelectLocationComponent implements OnInit, AfterViewInit,
                                                OnDestroy {
  @ViewChildren('multiCb')
  public multiCb: QueryList<any>;
  public styleId: number;

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

  public locations = [];
  public cloneLocations = [];
  public isDelete = false;

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _modalService: NgbModal,
              private _changeDetectorRef: ChangeDetectorRef,
              private _locationDetailSv: LocationDetailService,
              private _toastrService: ToastrService,
              private _salesOrderService: SalesOrderService,
              private _printLocationSv: PrintLocationService) {
    // empty
  }

  public ngOnInit(): void {
    this.locations.forEach((loc, index) => {
      this.cloneLocations[index] = loc.checked;
    });
  }

  public ngAfterViewInit(): void {
    this.multiCb.forEach((item, index) => {
      item.nativeElement.checked = this.cloneLocations[index];
    });
    this.multiCb.changes.subscribe((cb) => {
      cb.forEach((item, index) => {
        item.nativeElement.checked = this.cloneLocations[index];
      });
    });
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      isDisabled: new FormControl(false),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('')
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  /**
   * onValueChanged
   * @param data
   */
  public onValueChanged(data?): void {
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

  public changeChecked(index, location) {
    this.cloneLocations[index] = !location;
  }

  /**
   * Reset value form
   */
  public resetData(): void {
    this.buildForm();
  }

  public onSubmit() {
    this.isDelete = false;
    let locationIds = [];
    let shouldClose = false;
    this.locations.forEach((loc, index) => {
      if (loc.checked && !this.cloneLocations[index]) {
        this.isDelete = true;
      }
      if (!loc.checked && this.cloneLocations[index]) {
        locationIds.push(loc.id);
      }
    });
    if (!this.isDelete) {
      this.locations.forEach((loc, index) => {
        loc.checked = this.cloneLocations[index];
      });
      let idActive = this.locations.findIndex((l) => l.isActive === true);
      if (idActive !== -1 && !this.locations[idActive].checked) {
        let firstLocationChecked = this.locations.findIndex((l) => l.checked === true);
        if (firstLocationChecked !== -1) {
          this.locations[firstLocationChecked].isActive = true;
        }
        this.locations[idActive].isActive = false;
      }
      if (idActive === -1) {
        let firstLocationChecked = this.locations.findIndex((l) => l.checked === true);
        if (firstLocationChecked !== -1) {
          this.locations[firstLocationChecked].isActive = true;
        }
      }
      // this.activeModal.close(this.locations);
      shouldClose = true;
    } else {
      let modalRef = this._modalService.open(ConfirmDialogComponent, {
        keyboard: true
      });
      modalRef.componentInstance.message =
        'Are you sure you want to delete the selected Print Location(s)?';
      modalRef.componentInstance.title = 'Confirm Print Location Deletion';

      modalRef.result.then((res: boolean) => {
        if (res) {
          this.locations.forEach((loc, index) => {
            loc.checked = this.cloneLocations[index];
          });
          let idActive = this.locations.findIndex((l) => l.isActive === true);
          if (idActive !== -1 && !this.locations[idActive].checked) {
            let firstLocationChecked = this.locations.findIndex((l) => l.checked === true);
            if (firstLocationChecked !== -1) {
              this.locations[firstLocationChecked].isActive = true;
            }
            this.locations[idActive].isActive = false;
          }
          if (idActive === -1) {
            let firstLocationChecked = this.locations.findIndex((l) => l.checked === true);
            if (firstLocationChecked !== -1) {
              this.locations[firstLocationChecked].isActive = true;
            }
          }
          this.activeModal.close(this.locations);
          if (locationIds.length) {
            this.createPrintLocation(locationIds);
          }
        } else {
          this.isDelete = false;
          this._printLocationSv.deleteCancelled = true;
          this.activeModal.close();
        }
      });
    }
    if (locationIds.length && shouldClose) {
      this.createPrintLocation(locationIds);
    }
  }

  public createPrintLocation(locationIds) {
    this._locationDetailSv.addPrintLocationDetail(this.styleId, locationIds)
      .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            resp.data.forEach((data) => {
              let curLocation = this.locations.filter((l) => l.id === data.locationId);
              this._printLocationSv.printLocation.dataLocationList
                      [curLocation[0].text] = data.id;
            });
            this.activeModal.close(this.locations);
            this._toastrService.success(resp.message, 'Success');
            // revalidate before publish
            if (this._salesOrderService.hasErBeforePublish) {
              this._salesOrderService.reValidate(this._salesOrderService.orderIndex.orderId);
            }
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
  }

  public ngOnDestroy(): void {
    // empty
  }
}
