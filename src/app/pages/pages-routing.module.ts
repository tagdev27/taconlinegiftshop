import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutUsComponent } from './about-us/about-us.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { LookbookComponent } from './lookbook/lookbook.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SearchComponent } from './search/search.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CartComponent } from './cart/cart.component';
import { CollectionComponent } from './collection/collection.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ContactComponent } from './contact/contact.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CompareComponent } from './compare/compare.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TypographyComponent } from './typography/typography.component';
import { FaqComponent } from './faq/faq.component';
import { SocialTreeComponent } from "./social-tree/social-tree.component";
// Portfolio Page
import { GridTwoColComponent } from './portfolio/grid-two-col/grid-two-col.component';
import { GridThreeColComponent } from './portfolio/grid-three-col/grid-three-col.component';
import { GridFourColComponent } from './portfolio/grid-four-col/grid-four-col.component';
import { MasonaryTwoGridComponent } from './portfolio/masonary-two-grid/masonary-two-grid.component';
import { MasonaryThreeGridComponent } from './portfolio/masonary-three-grid/masonary-three-grid.component';
import { MasonaryFourGridComponent } from './portfolio/masonary-four-grid/masonary-four-grid.component';
import { MasonaryFullwidthComponent } from './portfolio/masonary-fullwidth/masonary-fullwidth.component';
import { LoginRouteGuard, DashboardRouteGuard } from '../route.guard';
import { TrackComponent } from './track/track.component';
import { ReturnPolicyComponent } from "./return-policy/return-policy.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { TermsComponent } from "./terms/terms.component";
import { OurStoryComponent } from "./our-story/our-story.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'about-us',
        component: AboutUsComponent
      },
      {
        path: 'return-policy',
        component: ReturnPolicyComponent
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent
      },
      {
        path: 'terms',
        component: TermsComponent
      },
      {
        path: 'our-story',
        component: OurStoryComponent
      },
      {
        path: 'social-tree',
        component: SocialTreeComponent
      },
      {
        path: '404',
        component: ErrorPageComponent
      },
      // {
      //   path: 'lookbook',
      //   component: LookbookComponent
      // },
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginRouteGuard]
      },
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [LoginRouteGuard]
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
        path: 'cart',
        component: CartComponent
      },
      {
        path: 'collections/:id',
        component: CollectionComponent
      },
      {
        path: 'forgetpassword',
        component: ForgetPasswordComponent,
        canActivate: [LoginRouteGuard]
      },
      {
        path: 'contact',
        component: ContactComponent
      },
      {
        path: 'checkout',
        component: CheckoutComponent
      },
      {
        path: 'compare',
        component: CompareComponent
      },
      {
        path: 'order-success',
        component: OrderSuccessComponent
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [DashboardRouteGuard]
      },
      {
        path: 'track-your-order',
        component: TrackComponent
      },
      // {
      //   path: 'typography',
      //   component: TypographyComponent
      // },
      // {
      //   path: 'faq',
      //   component: FaqComponent
      // },
      // {
      //   path: 'grid/two/column',
      //   component: GridTwoColComponent
      // },
      // {
      //   path: 'grid/three/column',
      //   component: GridThreeColComponent
      // },
      // {
      //   path: 'grid/four/column',
      //   component: GridFourColComponent
      // },
      // {
      //   path: 'grid/two/masonary',
      //   component: MasonaryTwoGridComponent
      // },
      // {
      //   path: 'grid/three/masonary',
      //   component: MasonaryThreeGridComponent
      // },
      // {
      //   path: 'grid/four/masonary',
      //   component: MasonaryFourGridComponent
      // },
      // {
      //   path: 'fullwidth/masonary',
      //   component: MasonaryFullwidthComponent
      // }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
