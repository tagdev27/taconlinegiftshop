import { Injectable } from '@angular/core';
import { Product } from '../classes/product';
import { CartItem } from '../classes/cart-item';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProductsService } from './products.service';
import { TacOrder, Tracking } from 'src/app/models/order';
import * as firebase from "firebase";
import { Order } from '../classes/order';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  // Array
  public OrderDetails;
  public OtherDetailsPayment;
  public locData;

  constructor(private router: Router, private productService: ProductsService) { }

  // Get order items
  public getOrderItems(): Order {
    return this.OrderDetails;
  }

  // Get other items
  public getOtherItems(): {} {
    return this.OtherDetailsPayment;
  }

  // Get other items
  public getLocationData(): {} {
    return this.locData;
  }

  // Create order
  public createOrder(product: any, details: any, other_payment_detals: any, orderId: any, amount: any, gcs: any, locationData:any) {
    this.addOrderToFirebase(product, details, other_payment_detals, orderId, amount, gcs, locationData)
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  date = new Date()
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  getDateNow() {
    return `${this.months[this.date.getUTCMonth()]} ${this.date.getUTCDate()}, ${this.date.getUTCFullYear()}`
  }

  addOrderToFirebase(product: any, details: any, other_payment_detals: any, orderId: any, amount: any, gcs: any, locationData:any) {
    const key = firebase.database().ref().push().key
    const track = this.randomInt(0, 999999999999)
    const track_details: Tracking[] = []
    const mT: Tracking = {
      title: 'Order Placed',
      text: 'We have received your order',
      icon: 'start',
      time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
    }
    track_details.push(mT)
    const order: TacOrder = {
      carts: product,
      currency_used: locationData['currency'],
      transaction_id: orderId,
      id: key,
      country: locationData['country'],
      email: details.email,
      created_date: `${this.getDateNow()} - ${new Date().toLocaleTimeString()}`,
      track_id: track,
      status: 'pending',
      total_amount: amount,
      shipping_details: details,
      gift_card_style: gcs,
      tracking_details: track_details,
      other_payment_detals: other_payment_detals
    }

    firebase.firestore().collection("alert-new-order").doc(key).set({
      'country': locationData['country'],
      'product_image': product[0].product['pictures'][0],
      'product_link': product[0].product['dynamic_link'],
      'product_name': product[0].product['name'],
      'product_price': product[0].product['price'],
      'username': details,
    }).then((d) => {
      firebase.firestore().collection('orders').doc(order.id).set(order).then(done => {
        var item: Order = {
          shippingDetails: details,
          product: product,
          orderId: orderId,
          totalAmount: amount,
          tracking_id: track
        };
        this.OrderDetails = item;
        this.OtherDetailsPayment = other_payment_detals
        this.locData = locationData
        this.router.navigate(['/home/checkout/success']);
      })
    })

    
  }

}
