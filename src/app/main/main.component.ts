import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ProductsService } from '../shared/services/products.service';
import { CartService } from '../shared/services/cart.service';
import { WishlistService } from '../shared/services/wishlist.service';
//declare var $: any;
import * as $ from 'jquery'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [ProductsService, CartService, WishlistService]
})
export class MainComponent implements OnInit {

  public url: any;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.url = event.url.toLowerCase();
      }
    });
  }

  ngOnInit() {
    $.getScript('assets/js/script.js');
    //  console.log('knwkfnikfwjiowjf')
    //  location.href = "/home"
  }

}
