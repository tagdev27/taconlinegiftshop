import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../shared/classes/product';
import { CartItem } from '../../../shared/classes/cart-item';
import { ProductsService } from '../../../shared/services/products.service';
import { WishlistService } from '../../../shared/services/wishlist.service';
import { CartService } from '../../../shared/services/cart.service';
import { Observable, of } from 'rxjs';
import { AppConfig } from 'src/app/services/global.service';
declare var $: any;

@Component({
  selector: 'app-product-box-metro',
  templateUrl: './product-box-metro.component.html',
  styleUrls: ['./product-box-metro.component.scss']
})
export class ProductBoxMetroComponent implements OnInit {

  @Input() product : Product;
config:AppConfig
  constructor(private router: Router, public productsService: ProductsService, 
    private wishlistService: WishlistService, private cartService: CartService) { 
      this.config = new AppConfig(productsService)
  }

  ngOnInit() {
    $.getScript('assets/js/masonary.js');
  }

  // Add to cart
  public addToCart(product: Product,  quantity: number = 1) {
    this.cartService.addToCart(product,quantity);
  }

  // Add to compare
  public addToCompare(product: Product) {
     this.productsService.addToCompare(product);
  }

  // Add to wishlist
  public addToWishlist(product: Product) {
     this.wishlistService.addToWishlist(product);
  }

}
