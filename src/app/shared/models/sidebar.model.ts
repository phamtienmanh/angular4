export interface SubMenuItem {
  routerLink: string;
  routerLinkActive: string;
  title: string;
  isView: boolean;
  isActive?: boolean;
}

export interface MenuItem extends SubMenuItem {
  icon: string;
  subMenu?: SubMenuItem[];
  subMenuOpen?: boolean;
}
