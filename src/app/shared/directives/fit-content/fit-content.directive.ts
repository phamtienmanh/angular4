import {
  Directive,
  ElementRef,
  Input,
  Renderer,
  HostListener,
  AfterViewChecked
} from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Directive({selector: 'ul[fitcontent]'})

export class FitContentDirective implements AfterViewChecked {
  private _change: Subject<string> = new Subject<string>();

  constructor(private el: ElementRef, private renderer: Renderer) {
    this._change
      .debounceTime(1000)
      .distinctUntilChanged()
      .subscribe((offsetWidth) => {
        this.onResize();
      });
  }

  public ngAfterViewChecked(): void {
    this._change.next(this.el.nativeElement.offsetWidth);
  }

  /**
   * Detect resize event of browser
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  public onResize(event?) {
    setTimeout(() => {
      if (this.el.nativeElement) {
        let totalWidth = 0;
        for (let child of this.el.nativeElement.children) {
          totalWidth += child.offsetWidth;
        }
        if (this.el.nativeElement.offsetWidth < totalWidth) {
          this.addClass(this.el.nativeElement, 'fit-content');
        } else {
          this.removeClass(this.el.nativeElement, 'fit-content');
        }
      }
    }, 200);
  }

  public classList(elm) {
    return (' ' + (elm.className || '') + ' ').replace(/\s+/gi, ' ');
  }

  public hasClass(elm, n) {
    let list = typeof elm === 'string' ? elm : this.classList(elm);
    return list.indexOf(' ' + n + ' ') >= 0;
  }

  public addClass(element, name) {
    let oldList = this.classList(element);
    let newList = oldList + name;
    if (this.hasClass(oldList, name)) {
      return;
    }
    // Trim the opening space.
    element.className = newList.substring(1);
  }

  public removeClass(element, name) {
    let oldList = this.classList(element);
    let newList;

    if (!this.hasClass(element, name)) {
      return;
    }

    // Replace the class name.
    newList = oldList.replace(' ' + name + ' ', ' ');

    // Trim the opening and closing spaces.
    element.className = newList.substring(1, newList.length - 1);
  }
}
