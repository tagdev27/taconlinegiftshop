import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../shared/classes/product';
import { ProductsService } from '../../../shared/services/products.service';
import { WishlistService } from '../../../shared/services/wishlist.service';
import { CartService } from '../../../shared/services/cart.service';
import { Observable, of } from 'rxjs';
import { AppConfig } from 'src/app/services/global.service';

@Component({
  selector: 'app-product-box-vertical',
  templateUrl: './product-box-vertical.component.html',
  styleUrls: ['./product-box-vertical.component.scss']
})
export class ProductBoxVerticalComponent implements OnInit {

  @Input() product: Product;

  public variantImage       :   any = ''; 
config:AppConfig
  constructor(private router: Router, public productsService: ProductsService,
    private wishlistService: WishlistService, private cartService: CartService) { 
      this.config = new AppConfig(productsService)
  }

  ngOnInit() { }

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

  // Change variant images
  public changeVariantImage(image) {
    this.variantImage = image;
  }  

}
