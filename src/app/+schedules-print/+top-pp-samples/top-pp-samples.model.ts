export enum TabTypes {
  All               = 0,
  QaPending         = 1,
  QaInPicking       = 2,
  QaFailed          = 3,
  QaPassed          = 4,
  ApprovedAndDone   = 5,
  ApprovedAndHold   = 6,
  Shipped           = 7,
  Cancelled         = 8,
  Archived          = 9
}

export const Tabs = [
  {
    filterType: TabTypes.All,
    name: 'All',
    isView: true,
    isActive: false,
    redirectUrl: 'all'
  },
  {
    filterType: TabTypes.QaPending,
    name: 'QA Pending',
    isView: true,
    isActive: false,
    redirectUrl: 'qa-pending'
  },
  {
    filterType: TabTypes.QaInPicking,
    name: 'QA In Picking',
    isView: true,
    isActive: false,
    redirectUrl: 'qa-in-picking'
  },
  {
    filterType: TabTypes.QaFailed,
    name: 'QA Failed',
    isView: true,
    isActive: false,
    redirectUrl: 'qa-failded'
  },
  {
    filterType: TabTypes.QaPassed,
    name: 'QA Passed',
    isView: true,
    isActive: false,
    redirectUrl: 'qa-passed'
  },
  {
    filterType: TabTypes.ApprovedAndDone,
    name: 'Approved & Done',
    isView: true,
    isActive: false,
    redirectUrl: 'approved-and-done'
  },
  {
    filterType: TabTypes.ApprovedAndHold,
    name: 'Approved & Hold',
    isView: true,
    isActive: false,
    redirectUrl: 'approved-and-hold'
  },
  {
    filterType: TabTypes.Shipped,
    name: 'Shipped',
    isView: true,
    isActive: false,
    redirectUrl: 'shipped'
  },
  {
    filterType: TabTypes.Cancelled,
    name: 'Cancelled',
    isView: true,
    isActive: false,
    redirectUrl: 'cancelled'
  },
  {
    filterType: TabTypes.Archived,
    name: 'Archived',
    isView: true,
    isActive: false,
    redirectUrl: 'archived'
  }
];
