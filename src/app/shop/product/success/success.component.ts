import { Component, OnInit, OnDestroy } from '@angular/core';
import { Order } from '../../../shared/classes/order';
import { OrderService } from '../../../shared/services/order.service';
import { ProductsService } from 'src/app/shared/services/products.service';
import { AppConfig } from 'src/app/services/global.service';
import { Observable } from 'rxjs';
import { CartService } from 'src/app/shared/services/cart.service';
import * as firebase from 'firebase';
import { Product } from 'src/app/shared/classes/product';

@Component({
  selector: 'app-order-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit, OnDestroy {

  public orderDetails: Order = {};
  public OtherDetailsPayment = {};
  config: AppConfig
  constructor(private orderService: OrderService, public productsService: ProductsService, public cartService: CartService) {
    this.config = new AppConfig(productsService)
  }

  date = new Date()
  months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  getDateNow() {
    return `${this.months[this.date.getUTCMonth()]} ${this.date.getUTCDate()}, ${this.date.getUTCFullYear()}`
  }

  ngOnInit() {
    this.orderDetails = this.orderService.getOrderItems();
    this.OtherDetailsPayment = this.orderService.getOtherItems()

    //send email automaticatlly
  }

  ngOnDestroy(){
    console.log('operation don start')
    this.updateStockLevelForProduct()
  }

  public getSubTotal(): Observable<number> {
    return this.config.convertTotalPrice(this.cartService.getTotalAmount());
  }

  clearAllCartFromFirebaseAndLocalStorage() {
    this.cartService.getItems().subscribe(mCart => {
      mCart.forEach(cart => {
        this.cartService.removeFromCart(cart)
      })
    })
  }

  updateStockLevelForProduct() {
    this.cartService.getItems().subscribe(mCart => {
      mCart.forEach(cart => {
        this.productsService.getProduct(cart.product.id).subscribe(async pro => {
          const quantity = cart.quantity
          await firebase.firestore().collection('db').doc('tacadmin').collection('products').doc(cart.product.key).update({
            'stock': pro.stock - quantity
          })
        })
      })
      this.clearAllCartFromFirebaseAndLocalStorage()
    })
  }

}
