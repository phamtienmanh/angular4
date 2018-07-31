import {
  Component,
  ViewEncapsulation,
  Input,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

// Interfaces
import {
  SelectComponent
} from 'ng2-select';
import {
  Subject
} from 'rxjs/Subject';

@Component({
  selector: 'ng-select-custom',
  templateUrl: 'ng-select-custom.template.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    'ng-select-custom.style.scss'
  ]
})
export class NgSelectCustomComponent implements OnInit,
                                                AfterViewInit,
                                                OnChanges {
  @ViewChild('ngSelect')
  public ngSelect: SelectComponent;

  @Input()
  public data = [];
  @Input()
  public asyncData = [];
  @Input()
  public multiple = false;
  @Input()
  public active;
  @Input()
  public activeProp = 'id';
  @Input()
  public visibleText = 'value';
  @Input()
  public allowClear = true;
  @Input()
  public focused = false;
  @Input()
  public placeholder = 'Select item...';
  @Input()
  public allowNewValue = false;
  @Input()
  public disabled = false;
  @Input()
  public alignTop = false;
  @Input()
  public activeNewMode = false;
  @Input()
  public isLimitItems = true;
  @Input()
  public preventTyping = false;
  @Input()
  public allowSearchInput = false;
  @Input()
  public debounceTime = 500;
  @Output()
  public value = new EventEmitter<any>();
  @Output()
  public onInputChange = new EventEmitter<any>();

  public isClicked;
  public currentValueActived;
  public activeItem = [];

  private isDeleted = false;
  private _tempEnv;
  private _inputChange: Subject<string> = new Subject<string>();

  public ngOnInit(): void {
    this.updateData(this.data);
    this._inputChange
      .debounceTime(this.debounceTime)
      .distinctUntilChanged()
      .subscribe((value) => {
        this.onInputChange.emit(value);
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.asyncData
      && changes.asyncData.currentValue
      && changes.asyncData.currentValue.length) {
      this.updateData(changes.asyncData.currentValue);
      if (this.allowSearchInput) {
        let newData = [];
        changes.asyncData.currentValue.forEach((i) => {
          newData.push({
            id: i.id,
            text: i[this.visibleText]
          });
        });
        this.ngSelect['options'] = newData;
      }
    } else if (changes.active && changes.active.currentValue) {
      this.updateData(this.data);
    } else if (changes.active && !changes.active.currentValue) {
      this.reset();
    }
  }

  public ngAfterViewInit(): void {
    if (this.focused) {
      this.focusedMe();
    }
    if (this.ngSelect) {
      this.ngSelect['open'] = () => this.open();
      this.ngSelect['mainClick'] = (e) => this.mainClick(e);
      this.ngSelect['clickedOutside'] = () => this.clickOutside();
    }
  }

  /**
   * focusedMe
   */
  public focusedMe() {
    setTimeout(() => {
      if (this.ngSelect) {
        this.ngSelect['matchClick'](new Event('click'));
      }
    });
  }

  /**
   * updateData
   * @param data
   */
  public updateData(data) {
    this.data = data || [];
    this.data.forEach((item) => {
      item['text'] = item[this.visibleText];
    });
    if (!!this.active) {
      if (this.active[this.visibleText]) {
        this.activeItem = [this.active[this.visibleText]];
      } else {
        let currentItemActive = this.data
          .find((item) => item[this.activeProp] === this.active);
        if (currentItemActive && currentItemActive[this.visibleText]) {
          this.activeItem = [currentItemActive[this.visibleText]];
        } else if (this.activeNewMode) {
          // bind value that not in data list
          this.activeItem = [this.active];
        }
      }
    }
  }

  /**
   * activeValue
   * @param data
   */
  public activeValue(data) {
    data.forEach((item) => {
      if (!item['text']) {
        item['text'] = item[this.visibleText];
      }
    });
    this.activeItem = data;
  }

  /**
   * onSelected
   * @param value
   */
  public onSelected(value) {
    if (this.ngSelect) {
      this.isClicked = false;
      // ---------Storage current actived item---------
      this.currentValueActived = this.ngSelect['active'][0];
      if (!this.multiple) {
        this.activeValue([value]);
      } else {
        this.isClicked = true;
        this.activeItem.push(value);
        this.activeValue(this.activeItem);
      }
      // Emit fully property value
      let currentValue = this.data.filter((item) => item[this.visibleText] === value.text);
      this.value.emit(currentValue[0]);
    }
  }

  /**
   * onRemoved
   * @param value
   */
  public onRemoved(value?) {
    if (this.ngSelect) {
      let itemRemove = this.activeItem.findIndex((item) => item.id === value.id);
      this.activeItem.splice(itemRemove, 1);
      this.ngSelect.placeholder = this.placeholder;
      this.value.emit(this.activeItem.length ? this.activeItem : '');
    }
  }

  /**
   * reset
   */
  public reset() {
    if (this.ngSelect) {
      this.ngSelect['active'] = [];
      this.activeItem = [];
    }
  }

  public getActiveString(): string {
    if (this.activeItem && this.activeItem.length) {
      return this.activeItem.map((i) => i[this.visibleText] || i).join(', ');
    } else {
      return '';
    }
  }

  /**
   * open
   */
  private open() {
    if (this.ngSelect) {
      this.isClicked = true;
      if (!this.multiple) {
        // -----------------------------------------------------------
        // ---------Storage current actived item---------
        this.currentValueActived = this.ngSelect['active'][0];
        // --------------Set placeholder is actived item--------------
        if (this.ngSelect['active'].length) {
          this.ngSelect.placeholder = this.ngSelect['active'][0].text;

          // hight light active select and keep text
          setTimeout(() => {
            let placeholder: string = this.ngSelect.placeholder;
            let selectElement: Element = this.ngSelect.element.nativeElement;
            if (selectElement.querySelector('.ui-select-search')) {
              selectElement.querySelector('.ui-select-search')['value'] = placeholder;
            }
            if (selectElement.querySelector('li[role="menuitem"] .ui-select-choices-row')) {
              selectElement.querySelector('li[role="menuitem"] .ui-select-choices-row')
                .classList.remove('active');
            }
            [].forEach.call(selectElement.querySelectorAll('.ui-select-choices-row'),
              (item: Element) => {
                if (item.querySelector('a div').textContent === placeholder) {
                  item.className += ' active';
                }
              });
          });
        }
        // -----Remove current actived item to visible placeholder----
        this.ngSelect['active'] = [];
        // -----------------------------------------------------------
      }
      // Origin code
      this.ngSelect.options = this.ngSelect.itemObjects
        .filter((option: any) => (this.ngSelect.multiple === false ||
          this.ngSelect.multiple === true && !this.ngSelect['active']
            .find((o: any) => option.text === o.text)));

      if (this.ngSelect.options.length > 0) {
        this.ngSelect['behavior'].first();
      }
      this.ngSelect['optionsOpened'] = true;
      if (this.preventTyping) {
        setTimeout(() => {
          let inputElm = this.ngSelect.element.nativeElement
            .querySelector('ng-select > div > input');
          if (inputElm) {
            const handler = (e) => {
              e.preventDefault();
            };
            inputElm.removeEventListener('keydown', handler, false);
            inputElm.addEventListener('keydown', handler, false);
          }
        });
      }
      // ---------------
    }
  }

  /**
   * activeNewValue
   * @param {string} newValue
   */
  private activeNewValue(newValue: string) {
    if (this.ngSelect) {
      this.data = this.data.filter((item) => !!item.text);
      // If new value duplicate value in list
      let duplValueIndex = this.data
        .findIndex((att) => att.text.toLowerCase() === newValue.toLowerCase());
      if (duplValueIndex > -1) {
        if (this.data[duplValueIndex].isNewValue) {
          this.data.splice(duplValueIndex, 1);
        } else {
          // Active value if input text duplicate with value in data
          this.activeItem = [this.data[duplValueIndex]];
          this.ngSelect['inputValue'] = '';
          this.ngSelect['inputMode'] = false;
          this.ngSelect['optionsOpened'] = false;
          return;
        }
      }
      // Add new item to value list
      this.data.push({
        id: Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000,
        text: newValue,
        isNewValue: true
      });
      // Active new value
      this.activeItem = [
        {
          text: newValue,
          isNewValue: true
        }
      ];
      // Select new value and validate submit
      this.ngSelect['inputValue'] = '';
      this.ngSelect['clickedOutside']();
    }
  }

  /**
   * mainClick
   * @param event
   */
  private mainClick(event: any): void {
    this._tempEnv = event;
    if (this.ngSelect) {
      if (this.allowSearchInput) {
        this._inputChange.next(this.ngSelect['inputValue']);
      }
      if (this.ngSelect['inputMode'] === true || this.ngSelect['_disabled'] === true) {
        // My code
        if (!this.multiple) {
          if (event.keyCode !== 9) {
            this.isDeleted = false;
          }
          if (this.allowNewValue && (event.keyCode === 13 || event.keyCode === 9)) {
            event.preventDefault();
            if (this.isDeleted) {
              this.clickOutside();
              this.isDeleted = false;
            } else {
              if (this.ngSelect['inputValue']) {
                this.activeNewValue(this.ngSelect['inputValue']);
              } else if (this.ngSelect.placeholder !== this.placeholder) {
                this.activeNewValue(this.ngSelect.placeholder);
              } else {
                // Default code of method
                this.ngSelect['inputMode'] = false;
                this.ngSelect['optionsOpened'] = false;
                return;
              }
              this.value.emit(this.activeItem[0]);
              this.reactiveValue(this.activeItem[0]
                ? this.activeItem[0] : this.currentValueActived);
            }
            return;
          } else if (event.keyCode === 9) {
            event.preventDefault();
            this.clickOutside();
            return;
          } else if (event.keyCode === 8) {
            event.preventDefault();
            if (this.ngSelect['inputValue'].length === 1) {
              this.isDeleted = true;
            }
            return;
          } else if (event.keyCode === 46) {
            this.isDeleted = true;
            this.clickOutside();
            this.isDeleted = false;
            return;
          }
        }
        // ---------------
        return;
      }
      // My code: Focus open dropdown
      if (event.keyCode === 9) {
        event.preventDefault();
        this.ngSelect['matchClick'](new Event('click'));
        return;
      }
      // --------------------------
      if (event.keyCode === 13 ||
        event.keyCode === 27 || (event.keyCode >= 37 && event.keyCode <= 40)) {
        event.preventDefault();
        return;
      }
      this.ngSelect['inputMode'] = true;
      let value = String
        .fromCharCode(96 <= event.keyCode && event.keyCode <= 105
          ? event.keyCode - 48 : event.keyCode).toLowerCase();
      this.ngSelect['focusToInput'](value);
      this.open();
      let target = event.target || event.srcElement;
      target.value = value;
      this.ngSelect.inputEvent(event);
      // ---------------
    }
  }

  /**
   * reactiveValue
   * @param activeItem
   */
  private reactiveValue(activeItem) {
    // Reactive actived item
    if (activeItem) {
      if (this.ngSelect) {
        this.ngSelect['active'] = [activeItem];
      }
    }
  }

  /**
   * clickOutside
   */
  private clickOutside() {
    if (this.ngSelect) {
      if (this.isClicked && !this.disabled) {
        this.ngSelect.placeholder = this.placeholder;
        this.isClicked = false;
        if (!this.multiple && !this.isDeleted) {
          if (this.allowNewValue) {
            // Active new value when click outside
            if (this.ngSelect['inputValue']) {
              this.activeNewValue(this.ngSelect['inputValue']);
              this.value.emit(this.activeItem[0]);
              this.reactiveValue(this.activeItem[0]
                ? this.activeItem[0] : this.currentValueActived);
            } else if (this.currentValueActived) {
              this.reactiveValue(this.currentValueActived);
            }
          } else {
            if (this.ngSelect.activeOption &&
              this.ngSelect['inputValue'] === this.ngSelect.activeOption['text']) {
              const item = {
                ...this.ngSelect.activeOption
              };
              item[this.visibleText] = this.ngSelect.activeOption['text'];
              this.reactiveValue(item);
              this.value.emit(item);
            } else if (this.currentValueActived) {
              this.reactiveValue(this.currentValueActived);
            }
          }
        }
        // Default code of method
        this.ngSelect['inputMode'] = false;
        this.ngSelect['optionsOpened'] = false;
      }
    }
  }
}
