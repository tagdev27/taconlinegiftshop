import { Injectable } from '@angular/core';
import { Product } from '../classes/product';
import { CartItem } from '../classes/cart-item';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import * as firebase from "firebase/app";
import 'firebase/firestore'
import { ProductsService } from './products.service';

// Get product from Localstorage
let products = JSON.parse(localStorage.getItem("cartItem")) || [];

@Injectable({
  providedIn: 'root'
})

export class CartService {

  // Array
  public cartItems: BehaviorSubject<CartItem[]> = new BehaviorSubject([]);
  public observer: Subscriber<{}>;

  constructor(private toastrService: ToastrService, private productService: ProductsService) {
    this.cartItems.subscribe(products => products = products);
  }

  // Get Products
  public getItems(): Observable<CartItem[]> {
    const itemsStream = new Observable(observer => {
      observer.next(products);
      observer.complete();
    });
    return <Observable<CartItem[]>>itemsStream;
  }


  // Add to cart
  public addToCart(product: Product, quantity: number): CartItem | boolean {
    var item: CartItem | boolean = false;
    // If Products exist
    let hasItem = products.find((items, index) => {
      if (items.product.id == product.id) {
        let qty = products[index].quantity + quantity;
        let stock = this.calculateStockCounts(products[index], quantity);
        if (qty != 0 && stock) {
          products[index]['quantity'] = qty;
          this.toastrService.success('This product has been added.');
        }
        return true;
      }
    });
    // If Products does not exist (Add New Products)
    if (!hasItem) {
      item = { product: product, quantity: quantity };
      products.push(item);
      this.toastrService.success('This product has been added.');
      this.addCartToFirebase(item)
    }

    localStorage.setItem("cartItem", JSON.stringify(products));
    return item;
  }

  // Update Cart Value
  public updateCartQuantity(product: Product, quantity: number): CartItem | boolean {
    return products.find((items, index) => {
      if (items.product.id == product.id) {
        let qty = products[index].quantity + quantity;
        let stock = this.calculateStockCounts(products[index], quantity);
        if (qty != 0 && stock) {
          products[index]['quantity'] = qty;
          this.updateCartInFirebase(product, qty)
        }
        localStorage.setItem("cartItem", JSON.stringify(products));
        return true;
      }
    });
  }

  // Calculate Product stock Counts
  public calculateStockCounts(product: CartItem, quantity): CartItem | Boolean {
    let qty = product.quantity + quantity;
    let stock = product.product.stock;
    if (stock < qty) {
      this.toastrService.error('You can not add more items than available. In stock ' + stock + ' items.');
      return false
    }
    return true
  }

  // Removed in cart
  public removeFromCart(item: CartItem) {
    if (item === undefined) return false;
    const index = products.indexOf(item);
    products.splice(index, 1);
    localStorage.setItem("cartItem", JSON.stringify(products));
    this.removeCartFromFirebase(item)
  }

  // Total amount 
  public getTotalAmount(): Observable<number> {
    return this.cartItems.pipe(map((product: CartItem[]) => {
      return products.reduce((prev, curr: CartItem) => {
        return prev + curr.product.price * curr.quantity;
      }, 0);
    }));
  }

  addCartToFirebase(item) {
    const pro: Product = item['product']
    const email = localStorage.getItem('email')
    firebase.firestore().collection("products-in-cart").doc(`${localStorage.getItem('unique-id-for-cart')}${pro.id}`).set({
      'id': `${localStorage.getItem('unique-id-for-cart')}${pro.id}`,
      'quantity': item['quantity'],
      'product': item['product'],
      'country': this.productService.country,
      'email': (email == null) ? 'not signed in' : email,
      'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
      'timestamp': firebase.firestore.FieldValue.serverTimestamp(),
      'browserID': localStorage.getItem('ut')
    })
  }

  removeCartFromFirebase(item) {
    const pro: Product = item['product']
    firebase.firestore().collection("products-in-cart").doc(`${localStorage.getItem('unique-id-for-cart')}${pro.id}`).delete()
  }

  updateCartInFirebase(pro: Product, quantity: number) {
    firebase.firestore().collection("products-in-cart").doc(`${localStorage.getItem('unique-id-for-cart')}${pro.id}`).update({
      'quantity': quantity
    })
  }
}