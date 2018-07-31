export interface TextSearch {
  keyword: string;
}

export interface FilterSearch {
  artId: string;
  orderId: string;
  customerNamePo: string;
  retailerPO: string;
  customerName: string;
  styleName: string;
  designId: string;
  printMethod: string;
  printApprovedDateOnUtc: Date;
}

export interface SearchObj {
  textSearch: TextSearch;
  filterSearch: FilterSearch;
}

export class SearchObj implements SearchObj {
  constructor() {
    this.textSearch = {
      keyword: undefined
    };
    this.filterSearch = {
      artId: undefined,
      orderId: undefined,
      customerNamePo: undefined,
      retailerPO: undefined,
      customerName: undefined,
      styleName: undefined,
      designId: undefined,
      printMethod: undefined,
      printApprovedDateOnUtc: undefined
    };
  }
}

export interface ArtworkInfo {
  id: number;
  imageUrl: string;
  artId: number;
  customerName: string;
  orderId: number;
  customerNamePoId: string;
  printLocation: string;
  vendor: string;
  style: string;
  color: string;
  printDate: Date;
  dueOn: Date;
  status: string;
}

export interface ArtworkResponse {
  data: ArtworkInfo[];
  totalRecord: number;
}

export const ArtworkViewColumns = {
  '8px': {
    designId: {
      width: 80,
      cellClass: 'columns-80'
    },
    customerName: {
      width: 80,
      cellClass: 'columns-80'
    },
    styleName: {
      width: 140,
      cellClass: 'columns-140'
    },
    vendorStyle: {
      width: 140,
      cellClass: 'columns-140'
    },
    approvalProcess: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabel: {
      width: 80,
      cellClass: 'columns-80'
    },
    printLocation: {
      width: 60,
      cellClass: 'columns-60'
    },
    printMethod: {
      width: 60,
      cellClass: 'columns-60'
    },
    printMachine: {
      width: 60,
      cellClass: 'columns-60'
    },
    dimensions: {
      width: 60,
      cellClass: 'columns-60'
    },
    printApprovedDateOnUtc: {
      width: 60,
      cellClass: 'columns-60'
    }
  },
  '9px': {
    designId: {
      width: 80,
      cellClass: 'columns-80'
    },
    customerName: {
      width: 80,
      cellClass: 'columns-80'
    },
    styleName: {
      width: 140,
      cellClass: 'columns-140'
    },
    vendorStyle: {
      width: 140,
      cellClass: 'columns-140'
    },
    approvalProcess: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabel: {
      width: 80,
      cellClass: 'columns-80'
    },
    printLocation: {
      width: 60,
      cellClass: 'columns-60'
    },
    printMethod: {
      width: 60,
      cellClass: 'columns-60'
    },
    printMachine: {
      width: 60,
      cellClass: 'columns-60'
    },
    dimensions: {
      width: 60,
      cellClass: 'columns-60'
    },
    printApprovedDateOnUtc: {
      width: 60,
      cellClass: 'columns-60'
    }
  },
  '10px': {
    designId: {
      width: 80,
      cellClass: 'columns-80'
    },
    customerName: {
      width: 80,
      cellClass: 'columns-80'
    },
    styleName: {
      width: 140,
      cellClass: 'columns-140'
    },
    vendorStyle: {
      width: 140,
      cellClass: 'columns-140'
    },
    approvalProcess: {
      width: 80,
      cellClass: 'columns-80'
    },
    neckLabel: {
      width: 80,
      cellClass: 'columns-80'
    },
    printLocation: {
      width: 60,
      cellClass: 'columns-60'
    },
    printMethod: {
      width: 60,
      cellClass: 'columns-60'
    },
    printMachine: {
      width: 60,
      cellClass: 'columns-60'
    },
    dimensions: {
      width: 60,
      cellClass: 'columns-60'
    },
    printApprovedDateOnUtc: {
      width: 60,
      cellClass: 'columns-60'
    }
  },
  '11px': {
    designId: {
      width: 100,
      cellClass: 'columns-100'
    },
    customerName: {
      width: 100,
      cellClass: 'columns-100'
    },
    styleName: {
      width: 140,
      cellClass: 'columns-140'
    },
    vendorStyle: {
      width: 100,
      cellClass: 'columns-100'
    },
    approvalProcess: {
      width: 100,
      cellClass: 'columns-100'
    },
    neckLabel: {
      width: 80,
      cellClass: 'columns-80'
    },
    printLocation: {
      width: 80,
      cellClass: 'columns-80'
    },
    printMethod: {
      width: 80,
      cellClass: 'columns-80'
    },
    printMachine: {
      width: 80,
      cellClass: 'columns-80'
    },
    dimensions: {
      width: 80,
      cellClass: 'columns-80'
    },
    printApprovedDateOnUtc: {
      width: 80,
      cellClass: 'columns-80'
    }
  },
  '12px': {
    designId: {
      width: 120,
      cellClass: 'columns-120'
    },
    customerName: {
      width: 120,
      cellClass: 'columns-120'
    },
    styleName: {
      width: 160,
      cellClass: 'columns-160'
    },
    vendorStyle: {
      width: 120,
      cellClass: 'columns-120'
    },
    approvalProcess: {
      width: 120,
      cellClass: 'columns-120'
    },
    neckLabel: {
      width: 100,
      cellClass: 'columns-100'
    },
    printLocation: {
      width: 100,
      cellClass: 'columns-100'
    },
    printMethod: {
      width: 100,
      cellClass: 'columns-100'
    },
    printMachine: {
      width: 100,
      cellClass: 'columns-100'
    },
    dimensions: {
      width: 100,
      cellClass: 'columns-100'
    },
    printApprovedDateOnUtc: {
      width: 100,
      cellClass: 'columns-100'
    }
  }
};
