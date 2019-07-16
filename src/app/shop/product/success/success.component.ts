import { Component, OnInit, OnDestroy } from '@angular/core';
import { Order } from '../../../shared/classes/order';
import { OrderService } from '../../../shared/services/order.service';
import { ProductsService } from 'src/app/shared/services/products.service';
import { AppConfig } from 'src/app/services/global.service';
import { Observable } from 'rxjs';
import { CartService } from 'src/app/shared/services/cart.service';
import * as firebase from 'firebase';
import { Product } from 'src/app/shared/classes/product';
import { EmailService } from 'src/app/shared/services/email.service';
import { CartItem } from 'src/app/shared/classes/cart-item';
import { HttpClient } from '@angular/common/http';
import * as $ from 'jquery'
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';

import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-order-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit, OnDestroy {

  public orderDetails: Order = {};
  public OtherDetailsPayment = {};
  config: AppConfig

  emailService = new EmailService()

  constructor(private orderService: OrderService, public productsService: ProductsService, public cartService: CartService, private http: HttpClient, private exportAsService: ExportAsService) {
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
    this.updateStockLevelForProduct()
    const curr = (this.productsService.currency == '₦') ? 'NGN' : this.productsService.currency
    //send email automaticatlly
    const billing_name = `${this.orderDetails.shippingDetails.firstname} ${this.orderDetails.shippingDetails.lastname}`
    const currency_total_amount = `${curr}${this.config.convertPrice(this.orderDetails.totalAmount)}`
    const trans_id = this.orderDetails.orderId
    const shipping_details = `${this.orderDetails.shippingDetails.fullname}
                              <br> ${this.orderDetails.shippingDetails.address}
                              <br> ${this.orderDetails.shippingDetails.state}, ${this.orderDetails.shippingDetails.country}<br>
                              Contact No. ${this.orderDetails.shippingDetails.recipientphone}`
    const currency_shipping_fee = `${curr}${this.config.convertPrice(this.OtherDetailsPayment['delivery'])}`
    const currency_tax_fee = `${curr}${this.config.convertPrice(this.OtherDetailsPayment['tax'])}`

    var cart_items = ''

    this.cartService.getItems().subscribe(mCart => {
      mCart.forEach(cart => {
        cart_items += `<tr>
        <td width="50%"
            class="m_-7433457280851606022ordered-item-label-td m_-7433457280851606022product"
            style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse">
            ${cart.quantity} x ${cart.product.name} </td>
        <td align="right" width="25%"
            class="m_-7433457280851606022ordered-item-unit-price-td"
            style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse;text-align:right">
            ${curr}${this.config.convertPrice(cart.product.price)}
        </td>
        <td align="right" width="25%"
            class="m_-7433457280851606022ordered-item-cost-td"
            style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse;text-align:right">
            ${curr}${this.config.convertPrice(cart.product.price) * cart.quantity}
        </td>
    </tr>`
      })
    })

    const email_body = this.emailService.getBody(this.getDateNow(), billing_name, currency_total_amount, trans_id, shipping_details, currency_shipping_fee, currency_tax_fee, cart_items, `${this.orderDetails.tracking_id}`)
    const email = this.orderDetails.shippingDetails.email
    this.uploadPDFToFirebase(email_body, email, trans_id, billing_name, email_body)
  }

  async uploadPDFToFirebase(body: string, email: string, trans_id: string, billing_name: string, email_body: string): Promise<any> {
    const key = firebase.database().ref().push().key
    $("#thehtml").append(body)
    const exportAsConfig: ExportAsConfig = {
      type: 'pdf', // the type you want to download
      fileName: `${key}.pdf`,
      elementId: 'getbody', // the id of html/table element
    }
    this.exportAsService.get(exportAsConfig).subscribe(base => {
      const upload_task = firebase.storage().ref("invoices").child(`${key}.pdf`)
      this.exportAsService.contentToBlob(base).subscribe(async file => {
        const put = await upload_task.put(file)
        const url = await upload_task.getDownloadURL()
        firebase.firestore().collection('invoices').doc(key).set({
          'id': key,
          'email': email,
          'invoice_id': trans_id,
          'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
          'invoice_url': url
        }).then(done => {
          $(function () {
            $.ajax({
              url: `https://avidprintsconcierge.com/emailsending/send.php?sender_email=${email}&sender_name=${billing_name}`,
              type: "post",
              dataType: "html",
              success: function (data) {
                //console.log("success" + data)
              },
              error: function (err) {
                //console.log("error" + err)
              },
              data: {
                body: `${email_body}`
              }
            });
          });
        })
      })
    })
  }

  ngOnDestroy() {
    this.clearAllCartFromFirebaseAndLocalStorage()
  }

  public getSubTotal(): Observable<number> {
    return this.config.convertTotalPrice(this.cartService.getTotalAmount());
  }

  clearAllCartFromFirebaseAndLocalStorage() {
    this.cartService.getItems().subscribe(mCart => {
      mCart.forEach(async cart => {
        const pro = cart.product
        await firebase.firestore().collection("products-in-cart").doc(`${localStorage.getItem('unique-id-for-cart')}${pro.id}`).delete()
      })
      localStorage.setItem("cartItem", "[]")
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
    })
  }

}
