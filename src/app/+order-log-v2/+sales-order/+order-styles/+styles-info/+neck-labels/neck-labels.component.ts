import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  PrintLocationService
} from '../+print-location/print-location.service';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'neck-labels',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'neck-labels.template.html',
  styleUrls: [
    // 'neck-labels.style.scss'
  ]
})
export class NeckLabelsComponent implements OnInit {

  public subTabs = [
    {
      text: 'Detail',
      isActive: true
    },
    {
      text: 'Art Files',
      isActive: false
    }
  ];
  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              public printLocationService: PrintLocationService) {
    // empty
  }

  public ngOnInit(): void {
    if (this._router.url.includes('art-files')) {
      this.subTabs[0].isActive = false;
      this.subTabs[1].isActive = true;
    }
  }

  public switchSubTab(event: Event, index: number) {
    let idActive = this.subTabs.findIndex((l) => l.isActive === true);
    if (idActive !== -1) {
      this.subTabs[idActive].isActive = false;
    }
    this.subTabs[index].isActive = true;
    switch (index) {
      case 0:
        this._router.navigate(['detail'],
          {relativeTo: this._activatedRoute});
        break;
      case 1:
        this._router.navigate(['art-files'], {relativeTo: this._activatedRoute});
        break;
      default:
        break;
    }
  }
}
