import {
  Injectable
} from '@angular/core';

@Injectable()
export class FinishingService {
  public searchObj;
  public searchFrom;

  public convertFrPrintOutsource() {
    this.searchObj.printDateFromOnUtc = this.searchObj.dateBeginConfigOnUtc;
    this.searchObj.printDateToOnUtc = this.searchObj.dateEndConfigOnUtc;
    this.searchObj.cancelDateFromOnUtc = this.searchObj.cancelDateFromConfigOnUtc;
    this.searchObj.cancelDateToOnUtc = this.searchObj.cancelDateToConfigOnUtc;
  }

  public convertFrPrintTsc() {
    this.searchObj.printDateFromOnUtc = this.searchObj.schedDateFromOnUtc;
    this.searchObj.printDateToOnUtc = this.searchObj.schedDateToOnUtc;
  }

  public convertFrNeckLabel() {
    this.searchObj.printDateFromOnUtc = this.searchObj.neckLabelDateFromOnUtc;
    this.searchObj.printDateToOnUtc = this.searchObj.neckLabelDateToOnUtc;
  }

  public convertFrSamples() {
    this.searchObj.printDate = this.searchObj.sampleDate || 'Next 7 Days';
    this.searchObj.printDateFromOnUtc = this.searchObj.sampleDateFromOnUtc;
    this.searchObj.printDateToOnUtc = this.searchObj.sampleDateToOnUtc;
  }
}
