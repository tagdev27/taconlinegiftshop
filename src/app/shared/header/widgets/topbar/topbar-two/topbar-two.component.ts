import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { LandingFixService } from '../../../../services/landing-fix.service';
import { DOCUMENT } from "@angular/common";
import { WINDOW } from '../../../../services/windows.service';
import { CartItem } from '../../../../classes/cart-item';
import { CartService } from '../../../../services/cart.service';
import { Observable, of } from 'rxjs';
import { StoreService } from 'src/app/services/store.settings';
declare var $: any;

@Component({
  selector: 'app-topbar-two',
  templateUrl: './topbar-two.component.html',
  styleUrls: ['./topbar-two.component.scss']
})
export class TopbarTwoComponent implements OnInit {

  public shoppingCartItems  :   CartItem[] = [];
  
  service = new StoreService()
  number = ''
  
  constructor(@Inject(DOCUMENT) private document: Document,
    @Inject(WINDOW) private window,private fix: LandingFixService, private cartService: CartService) { 
    this.cartService.getItems().subscribe(shoppingCartItems => this.shoppingCartItems = shoppingCartItems);
  }

  ngOnInit() {
    this.service.getSettings().then(store => {
      this.number = store.number
    })
   }

  openNav() {
  	this.fix.addNavFix();
  }

}
