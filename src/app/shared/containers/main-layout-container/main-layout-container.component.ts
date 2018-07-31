import {
  AfterViewInit,
  Component,
  DoCheck,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Util } from '../../services/util/util.service';
import {
  NavigationEnd,
  Router
} from '@angular/router';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'main-layout-container',  // <main-layout-container></main-layout-container>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './main-layout-container.template.html',
  styleUrls: [
    './main-layout-container.style.scss'
  ]
})
export class MainLayoutComponent implements DoCheck {
  @ViewChild('pageContainer')
  public pageContainerElm;

  public pageHeight: string;
  public noChangeHeightTimes: number;
  public _opened: boolean = false; // Must define this value to make the Sidebar API works

  constructor(private _utilService: Util) {
  }

  public ngDoCheck(): void {
    this.changeHeight();
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this.changeHeight();
  }

  public changeHeight(): void {
    if (this.pageContainerElm) {
      if (this.pageContainerElm.nativeElement.offsetHeight < window.innerHeight) {
        const height = window.innerHeight - this.pageContainerElm
          .nativeElement.offsetHeight;
        if (this.pageHeight !== `${height}px`) {
          this.pageHeight = `${height}px`;
          this.noChangeHeightTimes = 0;
        } else {
          this.noChangeHeightTimes++;
        }
      } else {
        this.pageHeight = `0px`;
      }
    }
  }
}
