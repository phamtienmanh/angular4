export const PageConfiguration: any = [
  {
    routerLink: '/dashboard',
    routerLinkActive: 'active',
    title: 'Dashboard',
    name: 'Dashboard',
    icon: 'fa fa-dashboard',
    isView: false
  },
  {
    routerLink: '/order-log-v2',
    routerLinkActive: 'active',
    title: 'Order Log',
    name: 'OrderLog',
    icon: 'fa fa-list-alt',
    isView: false,
    subMenu: [
      {
        routerLink: '/order-log-v2/all',
        routerLinkActive: 'active',
        title: 'All',
        name: 'All',
        isView: false
      },
      {
        routerLink: '/order-log-v2/domestic',
        routerLinkActive: 'active',
        title: 'Domestic',
        name: 'Domestic',
        isView: false
      },
      {
        routerLink: '/order-log-v2/imports',
        routerLinkActive: 'active',
        title: 'Imports',
        name: 'Import',
        isView: false
      },
      {
        routerLink: '/order-log-v2/outsource',
        routerLinkActive: 'active',
        title: 'Outsource',
        name: 'Outsource',
        isView: false
      },
      {
        routerLink: '/order-log-v2/sample-development',
        routerLinkActive: 'active',
        title: 'Sample Development',
        name: 'SampleDevelopment',
        isView: false
      }
    ],
    subMenuOpen: false
  },
  {
    routerLink: '/order-log-v2/all',
    routerLinkActive: 'active',
    title: 'Order Log',
    name: 'All',
    icon: 'fa fa-list-alt',
    isView: false
  },
  {
    routerLink: '/order-log-v2/domestic',
    routerLinkActive: 'active',
    title: 'Order Log',
    name: 'Domestic',
    icon: 'fa fa-list-alt',
    isView: false
  },
  {
    routerLink: '/order-log-v2/imports',
    routerLinkActive: 'active',
    title: 'Order Log',
    name: 'Imports',
    icon: 'fa fa-list-alt',
    isView: false
  },
  {
    routerLink: '/order-log-v2/outsource',
    routerLinkActive: 'active',
    title: 'Order Log',
    name: 'Outsource',
    icon: 'fa fa-list-alt',
    isView: false
  },
  {
    routerLink: '/order-log-v2/sample-development',
    routerLinkActive: 'active',
    title: 'Order Log',
    name: 'SampleDevelopment',
    icon: 'fa fa-list-alt',
    isView: false
  },
  {
    routerLink: '/projects',
    routerLinkActive: 'active',
    title: 'Projects',
    name: 'Projects',
    icon: 'fa fa-briefcase',
    isView: true
  },
  {
    routerLink: '/schedules-print',
    routerLinkActive: 'active',
    title: 'Schedules',
    name: 'Schedules',
    icon: 'custom-icon schedule-icon',
    isView: false
  },
  {
    routerLink: '/artwork-view',
    routerLinkActive: 'active',
    title: 'Artwork View',
    name: 'ArtworkView',
    icon: 'fa fa-paint-brush',
    isView: false
  },
  {
    routerLink: '/customers-management',
    routerLinkActive: 'active',
    title: 'Customers',
    name: 'Customers',
    icon: 'custom-icon cus-icon',
    isView: false
  },
  {
    routerLink: '/vendors-management',
    routerLinkActive: 'active',
    title: 'Vendors',
    name: 'Vendors',
    icon: 'custom-icon vendor-icon',
    isView: false
  },
  {
    routerLink: '/factory-management',
    routerLinkActive: 'active',
    title: 'Factories',
    name: 'Factories',
    icon: 'fa fa-industry',
    isView: false
  },
  {
    routerLink: '/user-management',
    routerLinkActive: 'active',
    title: 'Users',
    name: 'Users',
    icon: 'fa fa-user-o',
    isView: false
  },
  {
    routerLink: '/role-management',
    routerLinkActive: 'active',
    title: 'Roles',
    name: 'Roles',
    icon: 'fa fa-user-secret',
    isView: false
  },
  {
    routerLink: '/reports',
    routerLinkActive: 'active',
    title: 'Reports',
    name: 'Reports',
    icon: 'fa fa-book',
    isView: false
  },
  {
    routerLink: '/settings',
    routerLinkActive: 'active',
    title: 'Settings',
    name: 'Settings',
    icon: 'fa fa-cog',
    isView: false,
    subMenu: [
      {
        routerLink: '/settings/approval-type',
        routerLinkActive: 'active',
        title: 'Approval Type',
        name: 'ApprovalType',
        isView: false
      },
      {
        routerLink: '/settings/color',
        routerLinkActive: 'active',
        title: 'Color',
        name: 'Color',
        isView: false
      },
      {
        routerLink: '/settings/content',
        routerLinkActive: 'active',
        title: 'Content',
        name: 'Content',
        isView: false
      },
      {
        routerLink: '/settings/country-of-origin',
        routerLinkActive: 'active',
        title: 'Country of Origin',
        name: 'CountryOfOrigin',
        isView: false
      },
      {
        routerLink: '/settings/print-location',
        routerLinkActive: 'active',
        title: 'Print Location',
        name: 'PrintLocation',
        isView: false
      },
      {
        routerLink: '/settings/print-machine',
        routerLinkActive: 'active',
        title: 'Print Machine',
        name: 'PrintMachine',
        isView: false
      },
      {
        routerLink: '/settings/embellishment-type',
        routerLinkActive: 'active',
        title: 'Embellishment Type',
        name: 'EmbellishmentType',
        isView: false
      },
      {
        routerLink: '/settings/trim',
        routerLinkActive: 'active',
        title: 'Trim',
        name: 'Trim',
        isView: false
      },
      {
        routerLink: '/settings/customer-service',
        routerLinkActive: 'active',
        title: 'Customer Service Team',
        name: 'CustomerService',
        isView: false
      },
      {
        routerLink: '/settings/treatment',
        routerLinkActive: 'active',
        title: 'Treatments',
        name: 'Treatment',
        isView: false
      },
      {
        routerLink: '/settings/scheduled-tasks',
        routerLinkActive: 'active',
        title: 'Scheduled Tasks',
        name: 'ScheduledTasks',
        isView: false
      },
      {
        routerLink: '/settings/finishing-process',
        routerLinkActive: 'active',
        title: 'Finishing Process',
        name: 'FinishingProcess',
        isView: false
      },
      {
        routerLink: '/settings/product-categories',
        routerLinkActive: 'active',
        title: 'Product Categories',
        name: 'ProductCategories',
        isView: false
      },
      {
        routerLink: '/settings/product-regions',
        routerLinkActive: 'active',
        title: 'Product Regions',
        name: 'ProductRegions',
        isView: false
      },
      {
        routerLink: '/settings/licensors',
        routerLinkActive: 'active',
        title: 'Licensors',
        name: 'Licensors',
        isView: false
      },
      {
        routerLink: '/settings/licensees',
        routerLinkActive: 'active',
        title: 'Licensees',
        name: 'Licensees',
        isView: false
      },
      {
        routerLink: '/settings/retailer',
        routerLinkActive: 'active',
        title: 'Retailer',
        name: 'Retailer',
        isView: false
      }
    ],
    subMenuOpen: false
  }
];
