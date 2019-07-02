// Product Colors
export type ProductColor = 'white' | 'black' | 'red' | 'green' | 'purple' | 'yellow' | 'blue' | 'gray' | 'orange' | 'pink';

// Product Size
export type ProductSize = 'M' | 'L' | 'XL';

// Product Tag
export type ProductTags = 'nike' | 'puma' | 'lifestyle' | 'caprese';

// Product
export interface Product {
  // id?: number;
  // name?: string;
  // price?: number;
  // salePrice?: number;
  // discount?: number;
  // pictures?: string;
  // shortDetails?: string;
  // description?: string;
  // stock?: number;
  // new?: boolean;
  // sale?: boolean;
  // category?: string;
  // colors?: ProductColor[];
  // size?: ProductTags[];
  // tags?: ProductSize[];
  // variants?: any[];
  id?: number;
  key?: string;
  name?: string;
  price?: number;
  salePrice?: number;
  discount?: number;
  pictures?: string[];
  shortDetails?: string;
  description?: string;
  stock?: number;
  new?: boolean;
  sale?: boolean;
  category?: string;
  colors?: string[];//ProductColor
  size?: string[];//ProductSize
  tags?: string[];//ProductTags
  variants?: any[];
  
  items?: Item[];
  scheduled_sales_period?: string;
  weight?: number;
  created_date?: string;
  modified_date?: string;
  created_by?: string;
  dynamic_link?: string;
  menu_link?: string;
  deleted?: boolean;
  rating?:number;
}

// Color Filter
export interface ColorFilter {
  color?: ProductColor;
}

// Tag Filter
export interface TagFilter {
  tag?: ProductTags
}

export interface Item {
  display: string
  value:string
  id:string
}