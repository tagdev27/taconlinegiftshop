import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { HomeTwoComponent } from './home-2/home-two.component';
import { HomeThreeComponent } from './home-3/home-three.component';
import { HomeFourComponent } from './home-4/home-four.component';
import { HomeFiveComponent } from './home-5/home-five.component';
import { HomeSixComponent } from './home-6/home-six.component';
import { HomeSevenComponent } from './home-7/home-seven.component';
import { HomeEightComponent } from './home-8/home-eight.component';
import { HomeNineComponent } from './home-9/home-nine.component';
import { HomeTenComponent } from './home-10/home-ten.component';
import { HomeElevenComponent } from './home-11/home-eleven.component';
import { HomeTwelveComponent } from './home-12/home-twelve.component';
import { HomeThirteenComponent } from './home-13/home-thirteen.component';
import { HomeFourteenComponent } from './home-14/home-fourteen.component';
import { CollectionLeftSidebarComponent } from './product/collection/collection-left-sidebar/collection-left-sidebar.component';
import { CollectionRightSidebarComponent } from './product/collection/collection-right-sidebar/collection-right-sidebar.component';
import { CollectionNoSidebarComponent } from './product/collection/collection-no-sidebar/collection-no-sidebar.component';
import { ProductLeftSidebarComponent } from './product/product-details/product-left-sidebar/product-left-sidebar.component';
import { ProductRightSidebarComponent } from './product/product-details/product-right-sidebar/product-right-sidebar.component';
import { ProductNoSidebarComponent } from './product/product-details/product-no-sidebar/product-no-sidebar.component';
import { ProductColLeftComponent } from './product/product-details/product-col-left/product-col-left.component';
import { ProductColRightComponent } from './product/product-details/product-col-right/product-col-right.component';
import { ProductColumnComponent } from './product/product-details/product-column/product-column.component';
import { ProductAccordianComponent } from './product/product-details/product-accordian/product-accordian.component';
import { ProductLeftImageComponent } from './product/product-details/product-left-image/product-left-image.component';
import { ProductRightImageComponent } from './product/product-details/product-right-image/product-right-image.component';
import { ProductVerticalTabComponent } from './product/product-details/product-vertical-tab/product-vertical-tab.component';
import { SearchComponent } from './product/search/search.component';
import { WishlistComponent } from './product/wishlist/wishlist.component';
import { ProductCompareComponent } from './product/product-compare/product-compare.component';
import { CartComponent } from './product/cart/cart.component';
import { CheckoutComponent } from './product/checkout/checkout.component';
import { SuccessComponent } from './product/success/success.component';


// Routes
const routes: Routes = [
  { 
    path: 'one',
    component: HomeComponent
  },
  { 
    path: 'two',
    component: HomeTwoComponent
  },
  { 
    path: 'three',
    component: HomeThreeComponent
  },
  { 
    path: 'four',
    component: HomeFourComponent
  },
  { 
    path: 'five',
    component: HomeFiveComponent
  },
  { 
    path: 'six',
    component: HomeSixComponent
  },
  { 
    path: 'seven',
    component: HomeSevenComponent
  },
  { 
    path: 'eight',
    component: HomeEightComponent
  },
  { 
    path: 'nine',
    component: HomeNineComponent
  },
  { 
    path: 'ten',
    component: HomeTenComponent
  },
  { 
    path: 'eleven',
    component: HomeElevenComponent
  },
  { 
    path: 'twelve',
    component: HomeTwelveComponent
  },
  { 
    path: 'thirteen',
    component: HomeThirteenComponent
  },
  { 
    path: 'fourteen',
    component: HomeFourteenComponent
  },
  {
    path: 'left-sidebar/collection/:category',
    component: CollectionLeftSidebarComponent
  },
  {
    path: 'right-sidebar/collection/:category',
    component: CollectionRightSidebarComponent
  },
  {
    path: 'no-sidebar/collection/:category',
    component: CollectionNoSidebarComponent
  },
  {
    path: 'left-sidebar/product/:id',
    component: ProductLeftSidebarComponent
  },
  {
    path: 'right-sidebar/product/:id',
    component: ProductRightSidebarComponent
  },
  {
    path: 'no-sidebar/product/:id',
    component: ProductNoSidebarComponent
  },
  {
    path: 'col-left/product/:id',
    component: ProductColLeftComponent
  },
  {
    path: 'col-right/product/:id',
    component: ProductColRightComponent
  },
  {
    path: 'column/product/:id',
    component: ProductColumnComponent
  },
  {
    path: 'accordian/product/:id',
    component: ProductAccordianComponent
  },
  {
    path: 'left-image/product/:id',
    component: ProductLeftImageComponent
  },
  {
    path: 'right-image/product/:id',
    component: ProductRightImageComponent
  },
  {
    path: 'vertical/product/:id',
    component: ProductVerticalTabComponent
  },
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: 'wishlist',
    component: WishlistComponent
  },
  {
    path: 'compare',
    component: ProductCompareComponent
  },
  {
    path: 'cart',
    component: CartComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: 'checkout/success',
    component: SuccessComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
