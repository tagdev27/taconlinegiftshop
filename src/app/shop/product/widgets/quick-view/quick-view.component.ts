import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from '../../../../shared/classes/product';
import { CartItem } from '../../../../shared/classes/cart-item';
import { ProductsService } from '../../../../shared/services/products.service';
import { CartService } from '../../../../shared/services/cart.service';
import * as $ from 'jquery'
import { AppConfig } from 'src/app/services/global.service';
//declare var $: any;

@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.component.html',
  styleUrls: ['./quick-view.component.scss']
})
export class QuickViewComponent implements OnInit, OnDestroy {
  
  public products           :   Product[] = [];
  public counter            :   number = 1;
  public variantImage       :   any = '';
  public selectedColor      :   any = '';
  public selectedSize       :   any = '';
  config:AppConfig
  constructor(private productsService: ProductsService,
  	private cartService: CartService) {
      this.config = new AppConfig(productsService)
     }

  ngOnInit() {
  	this.productsService.getProducts().subscribe(product => this.products = product);
  }

  ngOnDestroy() {
    //a('.quickviewm').modal('hide');
    $('.quickviewm').hide();
    //jq().on('init', function (event, slick) {})
  }

  public increment() { 
      this.counter += 1;
  }

  public decrement() {
      if(this.counter >1){
          this.counter -= 1;
      }
  }
  
   // Change variant images
  public changeVariantImage(image) {
     this.variantImage = image;
     this.selectedColor = image;
  }

  // Change variant
  public changeVariantSize(variant) {
     this.selectedSize = variant;
  }

  public addToCart(product: Product, quantity) {
    if (quantity == 0) return false;
    this.cartService.addToCart(product, parseInt(quantity));
  }

}
