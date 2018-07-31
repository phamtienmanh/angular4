import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
  EventEmitter,
  Output
} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'collapse-panel',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './collapse-panel.template.html',
  styleUrls: [
    'collapse-panel.style.scss'
  ],
  animations: [
    trigger('collapse', [
      state('collapseState', style({height: '*'})),
      transition('* => void', [style({height: '*'}),
        animate(150, style({height: '0'}))]),
      transition('void => *', [style({height: '0'}),
        animate(150, style({height: '*'}))])
    ])
  ]
})
export class CollapsePanelComponent implements OnInit, OnChanges {
  @Input()
  public title: string;
  @Input()
  public formValue: Object;
  @Output()
  public onCollapse = new EventEmitter();

  public searchArr = [
    {
      name: 'Account Manager: ',
      prop: 'csr'
    },
    {
      name: 'Design ID: ',
      prop: 'designId'
    },
    {
      name: 'Entered By: ',
      prop: 'enteredBy'
    },
    {
      name: 'Customer: ',
      prop: 'customer'
    },
    {
      name: 'Customer: ',
      prop: 'customerName'
    },
    {
      name: 'Factory Name: ',
      prop: 'factoryName'
    },
    {
      name: 'PO #: ',
      prop: 'poId'
    },
    {
      name: 'Style Name: ',
      prop: 'styleName'
    },
    {
      name: 'Style Name: ',
      prop: 'designName'
    },
    {
      name: 'Emb. Type: ',
      prop: 'printMethod'
    },
    {
      name: 'Order Type: ',
      prop: 'fulfillmentType'
    },
    {
      name: 'Customer PO #: ',
      prop: 'customerPoId'
    },
    {
      name: 'Customer PO #: ',
      prop: 'customerPo'
    },
    {
      name: 'Partner Style: ',
      prop: 'partnerStyle'
    },
    {
      name: 'Retailer PO #: ',
      prop: 'retailerPoId'
    },
    {
      name: 'Retailer PO #: ',
      prop: 'retailerPo'
    },
    {
      name: 'Item Type: ',
      prop: 'itemType'
    },
    {
      name: 'Status: ',
      prop: 'colsName'
    },
    {
      name: 'Schedule: ',
      prop: 'printDate'
    },
    {
      name: 'Schedule: ',
      prop: 'sampleDate'
    },
    {
      name: 'Mach # / Vendor: ',
      prop: 'machines'
    },
    {
      name: 'Order Date: ',
      prop: 'orderDateFromOnUtc'
    },
    {
      name: 'to: ',
      prop: 'orderDateToOnUtc'
    },
    {
      name: 'Order Date: ',
      prop: 'orderDateBeginOnUtc'
    },
    {
      name: 'to: ',
      prop: 'orderDateEndOnUtc'
    },
    {
      name: 'Start Date: ',
      prop: 'startDateFromOnUtc'
    },
    {
      name: 'to: ',
      prop: 'startDateToOnUtc'
    },
    {
      name: 'Start Date: ',
      prop: 'startDateBeginOnUtc'
    },
    {
      name: 'to: ',
      prop: 'startDateEndOnUtc'
    },
    {
      name: 'Cancel Date from: ',
      prop: 'cancelDateFromOnUtc'
    },
    {
      name: 'to: ',
      prop: 'cancelDateToOnUtc'
    },
    {
      name: 'Cancel Date from: ',
      prop: 'cancelledDateFromOnUtc'
    },
    {
      name: 'to: ',
      prop: 'cancelledDateToOnUtc'
    },
    {
      name: 'Cancel Date from: ',
      prop: 'cancelDateBeginOnUtc'
    },
    {
      name: 'to: ',
      prop: 'cancelDateEndOnUtc'
    },
    {
      name: 'Cancel Date from: ',
      prop: 'cancelDateFromConfigOnUtc'
    },
    {
      name: 'to: ',
      prop: 'cancelDateToConfigOnUtc'
    },
    {
      name: 'Ship Date from: ',
      prop: 'shipDateBeginOnUtc'
    },
    {
      name: 'to: ',
      prop: 'shipDateEndOnUtc'
    },
    {
      name: 'Approved Date from: ',
      prop: 'approvedDateFromOnUtc'
    },
    {
      name: 'to: ',
      prop: 'approvedDateToOnUtc'
    }
  ];
  public scheduleDates = [
    'schedDateFromOnUtc',
    'schedDateToOnUtc',
    'dateBeginConfigOnUtc',
    'dateEndConfigOnUtc',
    'neckLabelDateFromOnUtc',
    'neckLabelDateToOnUtc',
    'printDateFromOnUtc',
    'printDateToOnUtc',
    'sampleDateFromOnUtc',
    'sampleDateToOnUtc'
  ];
  public summaryContent = '';
  public isCollapse = false;

  constructor() {
    // e
  }

  public ngOnInit() {
    // e
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.formValue.currentValue) {
      let formValue = changes.formValue.currentValue;
      this.summaryContent = '(';
      this.searchArr.forEach((s) => {
        if (formValue[s.prop]) {
          // Schedule Custom date
          if ((s.prop === 'printDate' || s.prop === 'sampleDate')
            && formValue[s.prop] === 'Custom') {
            this.scheduleDates.forEach((sDate) => {
              if (formValue[sDate]) {
                let dateValue = formValue[sDate];
                let fromOrTo = sDate.includes('DateFrom')
                  || sDate.includes('Begin') ? ' Schedule from: ' : ' to: ';
                this.summaryContent += fromOrTo + dateValue;
                this.summaryContent += fromOrTo === ' to: ' ? ', ' : '';
              }
            });
            return;
          }
          let searchValue = formValue[s.prop];
          if (searchValue.constructor === Array
            && searchValue.length) {
            if (s.prop === 'colsName') {
              let colsContent = '';
              searchValue.forEach((col) => {
                if (col.name) {
                  colsContent += col.name + ' - ' +
                    col.status.map((status) => status.name).join(', ') + ', ';
                }
              });
              if (colsContent) {
                this.summaryContent += s.name + colsContent;
              }
              return;
            }
            searchValue = searchValue.map((t) => t.text).join(', ');
          }
          if (s.prop === 'fulfillmentType' && searchValue >= 0 && searchValue < 5) {
            searchValue = ['', 'In Fulfillment', 'In DC', 'Drop Ship', 'In Store'][searchValue];
          }
          this.summaryContent += s.name + searchValue + ', ';
        }
      });
      this.summaryContent = this.summaryContent.replace(', to', ' to');
      if (this.summaryContent.length > 2) {
        this.summaryContent = this.summaryContent.slice(0, -2) + ')';
      } else {
        this.summaryContent = '';
      }
    }
  }

  public collapse(e: MouseEvent) {
    if (e.toElement &&
      e.toElement.tagName !== 'BUTTON' &&
      e.toElement.tagName !== 'I' &&
      e.toElement.tagName !== 'SPAN' &&
      !e.toElement.classList.contains('form-control') &&
      !e.toElement.classList.contains('icon-mydpcalendar') &&
      !e.toElement.classList.contains('selection')) {
      this.isCollapse = !this.isCollapse;
      this.onCollapse.emit();
    }
  }

  public expand() {
    if (this.isCollapse) {
      this.isCollapse =  false;
      this.onCollapse.emit();
    }
  }
}
