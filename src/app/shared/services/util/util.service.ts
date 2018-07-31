import 'rxjs/add/operator/pairwise';
import {
  HostListener,
  Injectable,
  Injector
} from '@angular/core';

import {
  Router,
  ActivatedRouteSnapshot,
  ActivatedRoute
} from '@angular/router';

import {
  Subject
} from 'rxjs/Subject';

@Injectable()
export class Util {
  public onRouteChange = new Subject<string>();
  // Observable string streams
  public onRouteChange$ = this.onRouteChange.asObservable();

  public onGlobalSearchChange = new Subject();
  // Observable string streams
  public onGlobalSearchChange$ = this.onGlobalSearchChange.asObservable();
  public scrollElm: any;

  public machineHeaderSelect;
  public machineNameHeaderSelect: string;
  public onmachineHeaderSelect = new Subject();
  public onmachineHeaderSelect$ = this.onmachineHeaderSelect.asObservable();

  private route = {
    previous: '',
    current: ''
  };
  private _router: Router;
  private _currentPage: number = 1;
  private _scrollPosition: number;
  private _globalSearch: string;
  private _artId: number;

  constructor(injector: Injector) {
    setTimeout(() => {
      this._router = injector.get(Router);
      this._router.events.pairwise().subscribe((data) => {
        if (!data[0]['id'] || !data[1]['id'] || data[0]['id'] === data[1]['id']) {
          return;
        } else {
          this.route = {
            previous: data[0]['url'],
            current: data[1]['url']
          };
          this.emitRouteChange(this.route.current);
        }

      });
    });
  }

  public get previousRouteUrl(): string {
    return this.route.previous;
  }

  public get currentRouteUrl(): string {
    return this.route.current;
  }

  public getFullRoutePath(suffix, route: ActivatedRouteSnapshot) {
    if (route.routeConfig && route.routeConfig.path) { // If the path not empty
      suffix = `${route.routeConfig.path}/${suffix}`;
    }
    if (route.parent) { // If it still has parent
      return this.getFullRoutePath(suffix, route.parent);
    }
    return '/' + suffix;
  }

  public getFullRoutePathByActivatedRoute(suffix, route: ActivatedRoute) {
    if (route.routeConfig && route.routeConfig.path) { // If the path not empty
      suffix = `${route.routeConfig.path}/${suffix}`;
    }
    if (route.parent) { // If it still has parent
      return this.getFullRoutePathByActivatedRoute(suffix, route.parent);
    }
    return '/' + suffix;
  }

  public getLastActivatedRoute(route: ActivatedRoute) {
    while (route.firstChild) {
      route = route.firstChild;
    }

    return route;
  }

  public emitRouteChange(url: string) {
    this.onRouteChange.next(url);
  }

  public set currentPage(value: number) {
    this._currentPage = value;
  }

  public get currentPage(): number {
    return this._currentPage;
  }

  public set scrollPosition(value: number) {
    this._scrollPosition = value;
  }

  public get scrollPosition(): number {
    return this._scrollPosition;
  }

  public set globalSearch(value: string) {
    this._globalSearch = value;
    this.onGlobalSearchChange.next();
  }

  public get globalSearch(): string {
    return this._globalSearch;
  }

  public set artId(value: number) {
    this._artId = value;
  }

  public get artId(): number {
    return this._artId;
  }

  public machineHeaderSelected() {
    this.onmachineHeaderSelect.next();
  }
}
