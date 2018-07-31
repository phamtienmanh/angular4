import {
  Injectable
} from '@angular/core';

@Injectable()
export class NeckLabelService {

  public searchObj;
  public searchFrom;

  public convertFrPrintOutsource() {
    this.searchObj.neckLabelDateFromOnUtc = this.searchObj.dateBeginConfigOnUtc;
    this.searchObj.neckLabelDateToOnUtc = this.searchObj.dateEndConfigOnUtc;
    this.searchObj.cancelDateFromOnUtc = this.searchObj.cancelDateFromConfigOnUtc;
    this.searchObj.cancelDateToOnUtc = this.searchObj.cancelDateToConfigOnUtc;
  }

  public convertFrPrintTsc() {
    this.searchObj.neckLabelDateFromOnUtc = this.searchObj.schedDateFromOnUtc;
    this.searchObj.neckLabelDateToOnUtc = this.searchObj.schedDateToOnUtc;
  }

  public convertFrFinishing() {
    this.searchObj.neckLabelDateFromOnUtc = this.searchObj.printDateFromOnUtc;
    this.searchObj.neckLabelDateToOnUtc = this.searchObj.printDateToOnUtc;
  }

  public convertFrSamples() {
    this.searchObj.printDate = this.searchObj.sampleDate || 'Next 7 Days';
    this.searchObj.neckLabelDateFromOnUtc = this.searchObj.sampleDateFromOnUtc;
    this.searchObj.neckLabelDateToOnUtc = this.searchObj.sampleDateToOnUtc;
  }
}
