import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../shared/classes/product';
import { CartItem } from '../../shared/classes/cart-item';
import { ProductsService } from '../../shared/services/products.service';
import { WishlistService } from '../../shared/services/wishlist.service';
import { CartService } from '../../shared/services/cart.service';
import { Observable, of } from 'rxjs';
import { AppConfig } from 'src/app/services/global.service';
import * as firebase from 'firebase';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})

export class ProductComponent implements OnInit {

  @Input() product: Product;
  //@Input() isGrid?: boolean = false;

  public variantImage: any = '';
  public selectedItem: any = '';

  public items: string[] = []

  config: AppConfig

  constructor(private router: Router, public productsService: ProductsService,
    private wishlistService: WishlistService, private cartService: CartService, private toastrService: ToastrService) {
    this.config = new AppConfig(productsService)
  }

  getProductItems() {
    const p_items = this.product.items

    p_items.forEach(async tem => {
      //console.log(tem.display)
      //const mItem = await this.getItemById(tem)
    })
  }

  getItemById(id: string) {
    return firebase.firestore().collection('db').doc('tacadmin').collection('items').where("deleted", "==", false).where("id", "==", id).get()
  }

  ngOnInit() {
    //this.getProductItems()
  }

  // Add to cart
  public addToCart(product: Product, quantity: number = 1) {
    if (product.stock < quantity) {
      this.toastrService.error('You can not add more items than available. In stock ' + product.stock + ' items.');
      return
    }
    this.cartService.addToCart(product, quantity);
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
    this.selectedItem = image;
  }

}
