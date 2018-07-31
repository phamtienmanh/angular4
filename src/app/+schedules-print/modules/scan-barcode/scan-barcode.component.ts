import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// 3rd modules
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  ScanBarcodeServive
} from './scan-barcode.servive';
import {
  BasicResponse
} from '../../../shared/models/respone.model';
import {
  ToastrService
} from 'ngx-toastr';
import {
  AuthService
} from '../../../shared/services/auth/auth.service';
import {
  Util
} from '../../../shared/services/util/util.service';

// Component

// Interfaces
enum ScanType {
  Print = 0,
  NeckLabel = 1,
  Finishing = 2
}

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'scan-barcode',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'scan-barcode.template.html',
  styleUrls: [
    'scan-barcode.style.scss'
  ]
})
export class ScanBarcodeComponent implements OnInit {
  public badgeId;
  public wrongBadgeId;
  public isWrongBadgeId = false;
  public isPageReadOnly = false;
  public scanType: number;
  public scanTypeName: string;

  constructor(public activeModal: NgbActiveModal,
              private _util: Util,
              private _router: Router,
              private _toastrService: ToastrService,
              private _authService: AuthService,
              private _scanBarcodeServive: ScanBarcodeServive) {
    // empty
  }

  public ngOnInit(): void {
    let funcName;
    if (this._router.url.includes('schedules-print/tsc-print')) {
      this.scanType = ScanType.Print;
      this.scanTypeName = 'Print Job';
      funcName = 'Schedules.Print.ProcessJob.Authorize';
    } else if (this._router.url.includes('schedules-print/neck-label')) {
      this.scanType = ScanType.NeckLabel;
      this.scanTypeName = 'Neck Label Job';
      funcName = 'Schedules.NeckLabel.ProcessJob.Authorize';
    } else if (this._router.url.includes('schedules-print/finishing')) {
      this.scanType = ScanType.Finishing;
      this.scanTypeName = 'Finishing Job';
      funcName = 'Schedules.Finishing.ProcessJob.Authorize';
    }
    // this.isPageReadOnly = !this._authService.checkPermissionFunc(funcName);
  }

  public onChange(event): void {
    if (event.target.value) {
      this.wrongBadgeId = event.target.value;
      this.onSubmit();
    }
  }

  public onSubmit() {
    this.isWrongBadgeId = false;
    if (this.isPageReadOnly) {
      this.isWrongBadgeId = true;
      this.badgeId = null;
    } else {
      this._scanBarcodeServive.scanBadgeBy(this.badgeId, this.scanType)
        .subscribe((resp: BasicResponse) => {
          if (resp.status) {
            this.isWrongBadgeId = false;
            this.activeModal.close({status: true});
          } else {
            this.isWrongBadgeId = true;
            this.badgeId = null;
          }
        });
    }
  }
}
