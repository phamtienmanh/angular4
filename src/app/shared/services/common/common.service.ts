import {
  Injectable
} from '@angular/core';

import {
  Response
} from '@angular/http';

import {
  Observable
} from 'rxjs/Observable';
import { FormGroup } from '@angular/forms';

// Services
import {
  ExtendedHttpService
} from '../http';
import * as moment from 'moment/moment';
import { Util } from '../util';
import { UserContext } from '../user-context';

// Interfaces
import {
  ResponseMessage,
  BasicCsrInfo,
  BasicCustomerInfo,
  BasicGeneralInfo,
  BasicVendorInfo,
  BasicResponse
} from '../../models';

@Injectable()
export class CommonService {
  public offsetTime: number;

  constructor(private http: ExtendedHttpService,
              private _userContext: UserContext,
              private _utilService: Util) {
    this.offsetTime = moment().utcOffset() / 60;
  }

  public updateSidebarConfig(pageConfig): any {
    const pagePermissions = this._userContext.currentUser.permissions
      .filter((i) => i.type === 1);
    const schedulesPage = pagePermissions.filter((i) => i.name.includes('Schedules.')
      && i.name.lastIndexOf('.') === i.name.indexOf('.'));
    let schedules = pageConfig.find((i) => i.name === 'Schedules');
    if (schedules) {
      schedules.isView = schedulesPage.some((i) => i.isView);
    }
    const orderLogPage = pagePermissions.filter((i) => i.name.includes('OrderLog.'));
    let orderLog = pageConfig.find((i) => i.name === 'OrderLog');
    if (orderLog) {
      orderLog.isView = orderLogPage.some((i) => i.isView);
    }
    const settingsPage = pagePermissions.filter((i) => i.name.includes('Settings.')
      && i.name.lastIndexOf('.') === i.name.indexOf('.'));
    let settings = pageConfig.find((i) => i.name === 'Settings');
    if (settings) {
      settings.isView = settingsPage.some((i) => i.isView);
    }
    const projectsPage = pagePermissions.filter((i) => i.name.includes('Projects.')
      && i.name.lastIndexOf('.') === i.name.indexOf('.'));
    let projects = pageConfig.find((i) => i.name === 'Projects');
    if (projects) {
      projects.isView = projectsPage.some((i) => i.isView);
    }
    const updateConfig = (config, preName = '') => {
      config.forEach((page) => {
        let samePage = pagePermissions
          .find((i) => i.name === `${preName}${page.name}`);
        if (samePage) {
          if (!samePage.description.includes('.')) {
            page.title = samePage.description;
          }
          page.isView = samePage.isView;
        }
      });
    };
    updateConfig(pageConfig);
    const settingsConfig: any = pageConfig.find((i) => i.name === 'Settings');
    if (settingsConfig) {
      updateConfig(settingsConfig.subMenu, 'Settings.');
    }

    let orderLogConfigIndex;
    const orderLogConfig: any = pageConfig.find((i, index) => {
      if (i.name === 'OrderLog') {
        orderLogConfigIndex = index;
        return i;
      }
    });
    if (orderLogConfig) {
      orderLogConfig.subMenu.forEach((page) => {
        page.isView = pagePermissions
          .some((i) => i.name.includes(`OrderLog.${page.name}.`) && i.isView);
      });
      orderLogConfig.isView = orderLogConfig.subMenu.some((i) => i.isView);

      const activatedOrderLogSubMenu = orderLogConfig.subMenu.filter((i) => i.isView);
      if (activatedOrderLogSubMenu.length === 1) {
        orderLogConfig.isView = false;
        const orderLogMenuConfig = pageConfig
          .find((i) => i.name === activatedOrderLogSubMenu[0].name);
        if (orderLogMenuConfig) {
          orderLogMenuConfig.isView = true;
        }
        pageConfig.splice(orderLogConfigIndex, 1);
      }
    }

    return pageConfig;
  }

  public markAsDirtyForm(frm: FormGroup, isPopup = false): void {
    for (const field of Object.keys(frm.controls)) {
      frm.get(field).markAsDirty();
      frm.get(field).markAsTouched();
      frm.get(field).updateValueAndValidity();
    }
    if (!isPopup) {
      setTimeout(() => {
        const errorControls = document.getElementsByClassName('has-error');
        if (errorControls.length
          && this._utilService.scrollElm) {
          this._utilService.scrollElm
            .scrollTop += errorControls[0].getBoundingClientRect().top - 60;
        }
      });
    }
  }

  public onNoSearchableFocused(select): void {
    // Call open after ng select toggle dropdown to avoid call same times
    setTimeout(() => {
      select.open();
    }, 100);
  }

  public getVersionApp(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/common/version`);
  }

  public getCsrRoleList(): Observable<ResponseMessage<BasicCsrInfo[]>> {
    return this.http.get(`/api/v1/common/csrs`);
  }

  public getAccountManagerList(): Observable<ResponseMessage<BasicCsrInfo[]>> {
    return this.http.get(`/api/v1/common/account-managers`);
  }

  public getUsersList(): Observable<ResponseMessage<BasicResponse[]>> {
    return this.http.get(`/api/v1/common/users`);
  }

  public getRejectOwnerList(): Observable<ResponseMessage<BasicCsrInfo[]>> {
    return this.http.get(`/api/v1/common/rejectowner`);
  }

  public getShippingCarrier(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/shippingcarrier`);
  }

  public getSamplesPrinter(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/common/sample-printers`);
  }

  public getProjectManageByUser(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/common/projects`);
  }

  public getRetailersList(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/common/retailer`);
  }

  public getCustomersList(isRetailer: boolean = false):
    Observable<ResponseMessage<BasicCustomerInfo[]>> {
    return this.http.get(`/api/v1/common/customers?isRetailer=${isRetailer}`);
  }

  public getAMandAdminList(): Observable<ResponseMessage<BasicCustomerInfo[]>> {
    return this.http.get(`/api/v1/common/project-manager-user`);
  }

  public getCustomersListByType(type: number): Observable<ResponseMessage<BasicCustomerInfo[]>> {
    return this.http.get(`/api/v1/outsource/customer?type=${type}`);
  }

  public getImportCustomersListByType(type: number):
    Observable<ResponseMessage<BasicCustomerInfo[]>> {
    return this.http.get(`/api/v1/import/customer?type=${type}`);
  }

  public getOrderTypeList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_ordertype`);
  }

  public getQualityUsers(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/quality-users`);
  }

  public getTrimsList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_trim`);
  }

  public getDropShipList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_dropship`);
  }

  public getShipFromList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_shipfrom`);
  }

  public getShipViaList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_shipvia`);
  }

  public getVendorList(): Observable<ResponseMessage<BasicCustomerInfo[]>> {
    return this.http.get(`/api/v1/common/vendors`);
  }

  // Style = 0, Partner = 1,Vendor = 2, A2000 = 3
  public getCStyleList(type: number): Observable<ResponseMessage<BasicCustomerInfo[]>> {
    return this.http.get(`/api/v1/common/c_style?type=${type}`);
  }

  public getA2000StyleList(keyword?: string): Observable<ResponseMessage<BasicCustomerInfo[]>> {
    return this.http
      .getNoLoading(`/api/v1/common/a2000styles?keyword=${keyword}`);
  }

  public getDesignList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/designs`);
  }

  public getCutList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_cut`);
  }

  public getColorList(keyword = ''): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http
      .getNoLoading(`/api/v1/common/c_color?keyword=${keyword}`);
  }

  public getContentList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_content`);
  }

  public getCooList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_coo`);
  }

  public getPrintMethods(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/print-methods`);
  }

  public getEmbellishmentTypes(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/embellishment-types`);
  }

  public getApprovalTypeList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_approvaltype`);
  }

  public getLocationList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_location`);
  }

  public getCategory(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/categories`);
  }

  public getPrintMachineList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_printmachine`);
  }

  public getSeparationTypeList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_separationtype`);
  }

  public getSpecialList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_special`);
  }

  public getLicensorList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_licensors`);
  }

  public getLicenseeList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_licensees`);
  }

  public getAllSizes(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/sizes`);
  }

  public getTreatmentList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/treatments`);
  }

  public getColorsDetailList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/colors`);
  }

  public getCustomerEmails(customerId: number): Observable<ResponseMessage<string[]>> {
    return this.http
      .getNoLoading(`/api/v1/common/customers/${customerId}/customer-emails`);
  }

  public getArtdepartments(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/common/artdepartments`);
  }

  public getStations(type: number): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/stations?type=${type}`);
  }

  public getMachineNVendor(type: string): Observable<ResponseMessage<BasicVendorInfo[]>> {
    return this.http.get(`/api/v1/common/vendors/${type}`);
  }

  public getPmsColor(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/pmscolor`);
  }

  public getSeparator(): Observable<ResponseMessage<BasicCsrInfo[]>> {
    return this.http.get(`/api/v1/common/separators`);
  }

  public getProcesses(): Observable<ResponseMessage<BasicCsrInfo[]>> {
    return this.http.get(`/api/v1/common/processes`);
  }

  public getFactoryList(type: number): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_factory?type=${type}`);
  }

  public getArtManagerAndArtists(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/artmanagersandartist`);
  }

  public getArtManagers(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/artmanagers`);
  }

  public getChangeJobList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_changejob`);
  }

  public getPoRange(customerName: string, customerPo: string):
    Observable<ResponseMessage<string[]>> {
    return this.http.getNoLoading(`/api/v1/common/` +
      `po-range?customerName=${customerName}&customerPo=${customerPo}`);
  }

  public getCountryList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/c_country`);
  }

  public getA2000Cust(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/a2000cust`);
  }

  public getFactoryStaff(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/factory-staff`);
  }

  public getIssueList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/issues`);
  }

  public getImportsDeptList(): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/common/imports-dept`);
  }
}
