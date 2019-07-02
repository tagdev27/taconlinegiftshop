export interface NavBarMenu {
    path?: string;
    title?: string;
    type?: string;
    megaMenu?: boolean;
    megaMenuType?: string; // small, medium, large
    image?: string;
    children?: NavBarMenu[];
  }