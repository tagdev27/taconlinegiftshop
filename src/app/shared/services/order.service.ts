import { Injectable } from '@angular/core';
import { Product } from '../classes/product';
import { CartItem } from '../classes/cart-item';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProductsService } from './products.service';
import { TacOrder } from 'src/app/models/order';
import * as firebase from 'firebase';
import { Order } from '../classes/order';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  // Array
  public OrderDetails;

  constructor(private router: Router, private productService: ProductsService) { }

  // Get order items
  public getOrderItems(): Order {
    return this.OrderDetails;
  }

  // Create order
  public createOrder(product: any, details: any, orderId: any, amount: any, gcs: any) {
    this.addOrderToFirebase(product, details, orderId, amount, gcs)
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  addOrderToFirebase(product: any, details: any, orderId: any, amount: any, gcs: any) {
    const key = firebase.database().ref().push().key
    const track = this.randomInt(0, 999999999999)
    const order: TacOrder = {
      carts: product,
      currency_used: this.productService.currency,
      transaction_id: orderId,
      id: key,
      country: this.productService.country,
      email: details.email,
      created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
      track_id: track,
      status: 'PENDING',
      total_amount: amount,
      shipping_details: details,
      gift_card_style: gcs,
      tracking_details: [{
        'title': 'Order Placed',
        'text': 'We have received your order',
        'icon': 'start',
        'time': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
      }]
    }
    firebase.firestore().collection('orders').doc(order.id).set(order).then(done => {
      var item: Order = {
        shippingDetails: details,
        product: product,
        orderId: orderId,
        totalAmount: amount,
        tracking_id: track
      };
      this.OrderDetails = item;
      this.router.navigate(['/home/checkout/success']);
    })
  }

}
