import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { IsotopeModule } from 'ngx-isotope';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AboutUsComponent } from './about-us/about-us.component';
import { ErrorPageComponent } from './error-page/error-page.component';
// import { LookbookComponent } from './lookbook/lookbook.component';
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
// import { FaqComponent } from './faq/faq.component';
// import { TypographyComponent } from './typography/typography.component';
// import { GridTwoColComponent } from './portfolio/grid-two-col/grid-two-col.component';
// import { GridThreeColComponent } from './portfolio/grid-three-col/grid-three-col.component';
// import { GridFourColComponent } from './portfolio/grid-four-col/grid-four-col.component';
// import { MasonaryTwoGridComponent } from './portfolio/masonary-two-grid/masonary-two-grid.component';
// import { MasonaryThreeGridComponent } from './portfolio/masonary-three-grid/masonary-three-grid.component';
// import { MasonaryFourGridComponent } from './portfolio/masonary-four-grid/masonary-four-grid.component';
// import { MasonaryFullwidthComponent } from './portfolio/masonary-fullwidth/masonary-fullwidth.component';
import { ReturnPolicyComponent } from "./return-policy/return-policy.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { TermsComponent } from "./terms/terms.component";
import { PresellBirthday } from "./presell-birthday/presell-birthday.component";
import { PresellValentine } from "./presell-valentine/presell-valentine.component";
import { OurStoryComponent } from "./our-story/our-story.component";
import { PresellSharedInput } from "./presell-shared-input/presell-shared-input.component";

import { SocialTreeComponent } from "./social-tree/social-tree.component";
import { TrackComponent } from "./track/track.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@NgModule({
  imports: [
    CommonModule,
    PagesRoutingModule,
    SlickCarouselModule,
    IsotopeModule,
    NgbModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AboutUsComponent,
    ErrorPageComponent,
    // LookbookComponent,
    LoginComponent,
    RegisterComponent,
    SearchComponent,
    WishlistComponent,
    CartComponent,
    CollectionComponent,
    ForgetPasswordComponent,
    ContactComponent,
    CheckoutComponent,
    CompareComponent,
    OrderSuccessComponent,
    DashboardComponent,
    // FaqComponent,
    // TypographyComponent,
    // GridTwoColComponent,
    // GridThreeColComponent,
    // GridFourColComponent,
    // MasonaryTwoGridComponent,
    // MasonaryThreeGridComponent,
    // MasonaryFourGridComponent,
    // MasonaryFullwidthComponent,
    SocialTreeComponent,
    TrackComponent,
    ReturnPolicyComponent,
    PrivacyPolicyComponent,
    TermsComponent,
    OurStoryComponent,
    PresellBirthday,
    PresellValentine,
    PresellSharedInput
  ]
})
export class PagesModule { }
