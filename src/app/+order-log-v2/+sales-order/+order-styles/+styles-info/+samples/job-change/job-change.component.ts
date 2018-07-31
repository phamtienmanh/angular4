import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import * as moment from 'moment';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  SampleService
} from '../sample.service';
import {
  CommonService
} from '../../../../../../shared/services/common';

// Interfaces
import {
  JobChange
} from '../sample.model';
import {
  ResponseMessage,
  BasicGeneralInfo
} from '../../../../../../shared/models';

@Component({
  selector: 'job-change',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'job-change.template.html',
  styleUrls: [
    'job-change.styles.scss'
  ]
})
export class JobChangeComponent implements OnInit {
  @Input()
  public styleId: number;
  @Input()
  public locationList: BasicGeneralInfo[];
  @Input()
  public jobChangeOrigin: JobChange;
  public jobChange: JobChange;
  public changeList = [];
  public isSubmitted = false;

  constructor(public activeModal: NgbActiveModal,
              private _commonService: CommonService,
              private _sampleService: SampleService,
              private _toastrService: ToastrService) {
    // empty
  }

  public ngOnInit(): void {
    this.jobChange = {...this.jobChangeOrigin};
    if (this.locationList.length === 1) {
      this.jobChange.printLocationId = this.locationList[0].id;
      this.jobChange.locationName = this.locationList[0].name;
    }
    this.convertTime(this.jobChange.processTime);
    this._commonService.getChangeJobList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
      if (resp.status) {
        this.changeList = _.filter(resp.data, (c) => c['type'] === 1);
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
    });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public convertTime(value) {
    let time = isNaN(value) ? value : Number(value);
    let duration = moment.duration(time, 'minutes');
    if (duration.asMilliseconds() === 0) {
      this.jobChange.timeConvert = '';
      this.jobChange.processTime = 0;
      return;
    }
    let hours = (Math.floor(duration.asMilliseconds() / 3600000)).toString();
    let minutes = duration.minutes().toString();
    this.jobChange.processTime = Number(hours) * 60 + Number(minutes);
    if (Number(hours) < 10) {
      hours = '0' + hours;
    }
    if (Number(minutes) < 10) {
      minutes = '0' + minutes;
    }
    this.jobChange.timeConvert = hours + ':' + minutes;
    // let regex = /^\d{1,2}\:\d{1,2}\$/;
    // return regex.test(value);
  }

  public onSubmit() {
    this.isSubmitted = true;
    setTimeout(() => {
      if (!this.jobChange.changeJobName ||
        !this.jobChange.timeConvert ||
        !this.jobChange.printLocationId) {
        return;
      }
      if (this.jobChange.id) {
        this._sampleService.updateJobChange(this.styleId, this.jobChange.id, this.jobChange)
          .subscribe((resp: ResponseMessage<JobChange>) => {
            if (resp.status) {
              this.activeModal.close({
                updateChange: resp.data
              });
              this._toastrService.success('Job change updated successfully.', 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
              this.activeModal.close();
            }
          });
      } else {
        this._sampleService.addJobChange(this.styleId, this.jobChange)
          .subscribe((resp: ResponseMessage<JobChange>) => {
            if (resp.status) {
              this._toastrService.success('Job change added successfully.', 'Success');
              this.activeModal.close({
                newChange: resp.data,
                isCleanBin: resp.data.changeJobName === 'First Strike'
              });
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
              this.activeModal.close();
            }
          });
      }
    });
  }

  public onCancel() {
    this.activeModal.dismiss();
  }
}
