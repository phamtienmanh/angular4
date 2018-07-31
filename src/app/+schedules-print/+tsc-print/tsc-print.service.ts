import {
  Injectable
} from '@angular/core';

@Injectable()
export class TscPrintService {

  public searchObj;
  public searchFrom;
  public isTsc = false;

  public convertToOutsource() {
    this.searchObj.dateBeginConfigOnUtc = this.searchObj.schedDateFromOnUtc;
    this.searchObj.dateEndConfigOnUtc = this.searchObj.schedDateToOnUtc;
    this.searchObj.cancelDateFromConfigOnUtc = this.searchObj.cancelDateFromOnUtc;
    this.searchObj.cancelDateToConfigOnUtc = this.searchObj.cancelDateToOnUtc;
  }

  public convertToTsc() {
    this.searchObj.schedDateFromOnUtc = this.searchObj.dateBeginConfigOnUtc;
    this.searchObj.schedDateToOnUtc = this.searchObj.dateEndConfigOnUtc;
    this.searchObj.cancelDateFromOnUtc = this.searchObj.cancelDateFromConfigOnUtc;
    this.searchObj.cancelDateToOnUtc = this.searchObj.cancelDateToConfigOnUtc;
  }

  public convertFrFinishing() {
    this.searchObj.schedDateFromOnUtc = this.searchObj.printDateFromOnUtc;
    this.searchObj.schedDateToOnUtc = this.searchObj.printDateToOnUtc;
  }

  public convertFrNeckLabel() {
    this.searchObj.schedDateFromOnUtc = this.searchObj.neckLabelDateFromOnUtc;
    this.searchObj.schedDateToOnUtc = this.searchObj.neckLabelDateToOnUtc;
  }

  public convertFrSamples() {
    this.searchObj.printDate = this.searchObj.sampleDate || 'Next 7 Days';
    this.searchObj.schedDateFromOnUtc = this.searchObj.sampleDateFromOnUtc;
    this.searchObj.schedDateToOnUtc = this.searchObj.sampleDateToOnUtc;
  }
}
