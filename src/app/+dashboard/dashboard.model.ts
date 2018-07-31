export const  DayRangeColumn = [
  {
    colName: '< 2 Days',
    prop: 'lessThan2Days',
    dataType: 'clickAble',
    from: 0,
    to: 1
  },
  {
    colName: '2-4 Days',
    prop: '_2To4Days',
    dataType: 'clickAble',
    from: 2,
    to: 4
  },
  {
    colName: '5-7 Days',
    prop: '_5To7Days',
    dataType: 'clickAble',
    from: 5,
    to: 7
  },
  {
    colName: '8-14 Days',
    prop: '_8To14Days',
    dataType: 'clickAble',
    from: 8,
    to: 14
  },
  {
    colName: '> 14 Days',
    prop: 'moreThan14Days',
    dataType: 'clickAble',
    from: 15,
    to: 999999
  }
];

export const  DayRangeColumn2 = [
  {
    colName: '< 2 Days',
    prop: 'lessThan2Days',
    dataType: 'number'
  },
  {
    colName: '2-4 Days',
    prop: '_2To4Days',
    dataType: 'number'
  },
  {
    colName: '5-7 Days',
    prop: '_5To7Days',
    dataType: 'number'
  },
  {
    colName: '8-14 Days',
    prop: '_8To14Days',
    dataType: 'number'
  },
  {
    colName: '> 14 Days',
    prop: 'moreThan14Days',
    dataType: 'number'
  }
];

export const  SummaryColumn = [
  {
    colName: 'FirstName',
    prop: 'firstName',
    dataType: 'string'
  },
  {
    colName: 'LastName',
    prop: 'lastName',
    dataType: 'string'
  },
  ...DayRangeColumn2,
  {
    colName: 'Total',
    prop: 'total',
    dataType: 'number'
  }
];

export const  UnpublishedSummaryColumn = [
  {
    colName: 'FirstName',
    prop: 'firstName',
    dataType: 'string'
  },
  {
    colName: 'LastName',
    prop: 'lastName',
    dataType: 'string'
  },
  ...DayRangeColumn2,
  {
    colName: 'Total',
    prop: 'unPublishedCount',
    dataType: 'number'
  }
];

export const UnpublishedDetailColumn = [
  {
    colName: 'Customer',
    prop: 'company',
    dataType: 'string'
  },
  {
    colName: 'PO #',
    prop: 'customerPoId',
    dataType: 'orderLink'
  },
  {
    colName: 'Created On',
    prop: 'createdOnUtc',
    dataType: 'date'
  },
  {
    colName: 'Days',
    prop: 'days',
    dataType: 'string'
  }
];

export const  A2000ImportErrorsColumn = [
  {
    colName: 'Customer Code',
    prop: 'customer',
    dataType: 'string'
  },
  {
    colName: 'Customer Name',
    prop: 'custName',
    dataType: 'string'
  },
  {
    colName: 'Customer PO',
    prop: 'baseOrderNo',
    dataType: 'orderLink'
  },
  {
    colName: 'Entered By',
    prop: 'enteredBy',
    dataType: 'string'
  },
  {
    colName: 'Order Date',
    prop: 'orderDate',
    dataType: 'date'
  },
  {
    colName: 'Start Date',
    prop: 'startDate',
    dataType: 'date'
  },
  {
    colName: 'Cancel Date',
    prop: 'cancelDate',
    dataType: 'date'
  },
  {
    colName: '# Line Items',
    prop: 'lineItems',
    dataType: 'string'
  },
  {
    colName: 'Book Qty',
    prop: 'bookQty',
    dataType: 'string'
  },
  {
    colName: 'Ship Qty',
    prop: 'shipQty',
    dataType: 'string'
  },
  {
    colName: 'Cancel Qty',
    prop: 'cancelQty',
    dataType: 'string'
  },
  {
    colName: '# Stores',
    prop: 'numStores',
    dataType: 'string'
  }
];

export const  STNColumn = [
  {
    colName: '',
    prop: '',
    dataType: 'noProp'
  },
  ...DayRangeColumn,
  {
    colName: 'Total',
    prop: 'total',
    dataType: 'number'
  }
];

export const  STNADetailColumn = [
  {
    colName: 'Customer',
    prop: 'company',
    dataType: 'string'
  },
  {
    colName: 'Customer PO',
    prop: 'customerPoId',
    dataType: 'orderLink'
  },
  {
    colName: 'Cancel Date',
    prop: 'cancelDateOnUtc',
    dataType: 'date'
  },
  {
    colName: 'Created On',
    prop: 'createdOnUtc',
    dataType: 'date'
  },
  {
    colName: 'Published Date',
    prop: 'publishedDateOnUtc',
    dataType: 'date'
  },
  {
    colName: 'Days',
    prop: 'days',
    dataType: 'string'
  },
  {
    colName: 'Style',
    prop: 'style',
    dataType: 'styleLink'
  }
];

export const  DTPColumn = [
  {
    colName: 'FirstName',
    prop: 'firstName',
    dataType: 'string'
  },
  {
    colName: 'LastName',
    prop: 'lastName',
    dataType: 'string'
  },
  ...DayRangeColumn2,
  {
    colName: 'Total',
    prop: 'unPublishedCount',
    dataType: 'number'
  }
];

export const  DTPDetailColumn = [
  {
    colName: 'Customer PO',
    prop: 'customerPoId',
    dataType: 'orderLink'
  },
  {
    colName: 'Created On',
    prop: 'createdOnUtc',
    dataType: 'date'
  },
  {
    colName: 'Published Date',
    prop: 'publishedDateOnUtc',
    dataType: 'date'
  },
  {
    colName: 'Days',
    prop: 'days',
    dataType: 'string'
  }
];

export const  BNPSummaryColumn = [
  {
    colName: 'Cancel Start Date',
    prop: 'cancelStartDate',
    dataType: 'date'
  },
  {
    colName: 'Cancel End Date',
    prop: 'cancelEndDate',
    dataType: 'date'
  },
  {
    colName: 'Cancel Date Week #',
    prop: 'cancelDateWeekNo',
    dataType: 'string'
  },
  {
    colName: 'Unknown',
    prop: 'unknown',
    dataType: 'number'
  },
  ...DayRangeColumn2,
  {
    colName: 'Total',
    prop: 'blankStylesNotPurchasedCount',
    dataType: 'number'
  }
];

export const  BNPDetailColumn = [
  {
    colName: 'Customer',
    prop: 'company',
    dataType: 'string'
  },
  {
    colName: 'Customer PO',
    prop: 'customerPoId',
    dataType: 'orderLink'
  },
  {
    colName: 'Cancel Date',
    prop: 'cancelDateOnUtc',
    dataType: 'date'
  },
  {
    colName: 'Days',
    prop: 'days',
    dataType: 'string'
  },
  {
    colName: 'Style',
    prop: 'style',
    dataType: 'styleLink'
  }
];

export const  TNPSummaryColumn = [
  {
    colName: 'Cancel Start Date',
    prop: 'cancelStartDate',
    dataType: 'date'
  },
  {
    colName: 'Cancel End Date',
    prop: 'cancelEndDate',
    dataType: 'date'
  },
  {
    colName: 'Cancel Date Week #',
    prop: 'cancelDateWeekNo',
    dataType: 'string'
  },
  {
    colName: 'Unknown',
    prop: 'unknown',
    dataType: 'number'
  },
  ...DayRangeColumn2,
  {
    colName: 'Total',
    prop: 'trimStylesNotPurchasedCount',
    dataType: 'number'
  }
];

export const  TNPDetailColumn = [
  ...BNPDetailColumn,
  {
    colName: 'Trim Type',
    prop: 'name',
    dataType: 'string'
  }
];

export const ReportTypes = [
  {
    name: 'Unpublished',
    title: 'Unpublished',
    summaryCols: UnpublishedSummaryColumn,
    detailCols: UnpublishedDetailColumn,
    isHaveSideDetail: true,
    isHaveTotals: true
  },
  {
    name: 'A2000 Import Errors',
    title: 'A2000 Import Errors',
    summaryCols: A2000ImportErrorsColumn,
    detailCols: null,
    isHaveSideDetail: false,
    isHaveTotals: false
  },
  {
    name: 'Staging Tickets Needed',
    title: 'Staging Tickets Needed',
    summaryCols: STNColumn,
    detailCols: STNADetailColumn,
    isHaveSideDetail: false,
    isHaveTotals: false
  },
  {
    name: 'Staging Tickets Not Approved',
    title: 'Staging Tickets Not Approved',
    summaryCols: SummaryColumn,
    detailCols: STNADetailColumn,
    isHaveSideDetail: true,
    isHaveTotals: true
  },
  {
    name: 'Days To Publish',
    title: 'Days to Publish – Last 2 Weeks',
    summaryCols: DTPColumn,
    detailCols: DTPDetailColumn,
    isHaveSideDetail: true,
    isHaveTotals: true
  },
  {
    name: 'Blanks Not Purchased',
    title: 'Blanks Not Purchased',
    summaryCols: BNPSummaryColumn,
    detailCols: BNPDetailColumn,
    isHaveSideDetail: true,
    isHaveTotals: true
  },
  {
    name: 'Trims Not Purchased',
    title: 'Trims Not Purchased',
    summaryCols: TNPSummaryColumn,
    detailCols: TNPDetailColumn,
    isHaveSideDetail: true,
    isHaveTotals: true
  }
];
