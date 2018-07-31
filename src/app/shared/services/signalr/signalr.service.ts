import {
  Injectable
} from '@angular/core';

import {
  Response
} from '@angular/http';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  UserContext
} from '../user-context';
import { ExtendedHttpService } from '../http';

// Import signalR module
import {
  IConnectionOptions,
  SignalR,
  ISignalRConnection
} from 'ng2-signalr';

// Global const
import {
  AppConstant
} from '../../../app.constant';
import {
  PushNotificationsService
} from 'angular2-notifications';
import {
  ResponseMessage,
  UserInfo
} from '../../models';

@Injectable()
export class SignalRService {
  public _signalRConnection: ISignalRConnection;

  constructor(private _userContext: UserContext,
              private _http: ExtendedHttpService,
              private _signalR: SignalR,
              private _pushNotificationsService: PushNotificationsService) {
    // empty
  }

  /**
   * connect
   */
  public connect() {
    let options: IConnectionOptions = {
      hubName: 'messageHub',
      url: AppConstant.domain,
      qs: {Bearer: this._userContext.userToken.accessToken}
    };
    let self = this;
    let conx = this._signalR.createConnection(options);
    conx.status.subscribe((s: any) => {
      if (s) {
        console.log(`SignalR ${s.name}.`);
      }
    });
    conx.start().then((c) => {
      self._signalRConnection = c;
      // join to group
      self._signalRConnection.invoke('join');
      // listen event
      self.listenerAddReminder();
      self.listenerDeleteReminder();
      self.listenerDeployEvent();
    }, (err) => {
      console.log('SignalR Error: ' + JSON.stringify(err));
    });
  }

  /**
   * start
   */
  public start() {
    if (this._signalRConnection) {
      this._signalRConnection.start().then((c) => {
        // console.log('started connection: ' + c);
      });
    }
  }

  /**
   * stop
   */
  public stop() {
    if (this._signalRConnection) {
      this._signalRConnection.stop();
    }
    // console.log('stopped connection');
  }

  /**
   * invoke
   * @param method
   */
  public invoke(method): any {
    // invoke a server side method
    if (this._signalRConnection) {
      this._signalRConnection.invoke(method).then((data: string[]) => {
        return data;
      });
    }
  }

  /**
   * invokeWithParameters
   * @param method
   * @param parameters
   */
  public invokeWithParameters(method, parameters): any {
    // invoke a server side method, with parameters
    if (this._signalRConnection) {
      this._signalRConnection.invoke('method', parameters).then((data: string[]) => {
        return data;
      });
    }
  }

  /**
   * listener AddReminder event
   * @param method
   */
  public listenerAddReminder() {
    if (this._signalRConnection) {
      let onMessageSent$ = this._signalRConnection.listenFor('addReminder');
      onMessageSent$.subscribe((message: any) => {
        let currentUser = this._userContext.currentUser;
        let myDate = new Date(message.createdOnUtc);
        myDate.setHours(myDate.getHours() + myDate.getTimezoneOffset() / 60);
        message.createdOnUtc = myDate.toString();
        currentUser.reminders.unshift(message);
        this._userContext.update(currentUser);
        if (this._pushNotificationsService.permission === 'granted') {
          this._pushNotificationsService.create(`${message.fullName} sent you a reminder`,
            {
              body: message.content,
              icon: message.avatarUrl
            }
          ).subscribe();
        }
      });
      let onRoleMessageSent$ = this._signalRConnection.listenFor('updateRolePermission');
      onRoleMessageSent$.subscribe((message: any) => {
        this.getUserInfo(this._userContext.currentUser.id)
          .subscribe((resp: ResponseMessage<UserInfo>) => {
            if (resp.status) {
              this._userContext.update(resp.data);
              this._userContext.onUserInfoChange.emit();
            }
          });
      });
    }
  }

  /**
   * listenerDeleteReminder
   */
  public listenerDeleteReminder() {
    if (this._signalRConnection) {
      let onMessageSent$ = this._signalRConnection.listenFor('deleteReminder');
      onMessageSent$.subscribe((message: any) => {
        let currentUser = this._userContext.currentUser;
        // item remove
        let item = currentUser.reminders.find((x) => x.id === message.id);
        if (item) {
          let index: number = currentUser.reminders.indexOf(item);
          if (index !== -1) {
            currentUser.reminders.splice(index, 1);
          }
        }
      });
    }
  }

  /**
   * listenerDeleteReminder
   */
  public listenerDeployEvent() {
    if (this._signalRConnection) {
      let onMessageSent$ = this._signalRConnection.listenFor('triggerEvent');
      onMessageSent$.subscribe((message: any) => {
        location.reload();
      });
    }
  }

  public getUserInfo(id: number): Observable<ResponseMessage<UserInfo>> {
    return this._http.get(`/api/v1/account/users/${id}`);
    // .catch(this.handleError);
  }
}
