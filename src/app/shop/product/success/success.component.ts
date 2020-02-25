import { Component, OnInit, OnDestroy } from '@angular/core';
import { Order } from '../../../shared/classes/order';
import { OrderService } from '../../../shared/services/order.service';
import { ProductsService } from 'src/app/shared/services/products.service';
import { AppConfig } from 'src/app/services/global.service';
import { Observable } from 'rxjs';
import { CartService } from 'src/app/shared/services/cart.service';
import * as firebase from "firebase/app";
import 'firebase/firestore'
import 'firebase/storage'
import { Product } from 'src/app/shared/classes/product';
import { EmailService } from 'src/app/shared/services/email.service';
import { CartItem } from 'src/app/shared/classes/cart-item';
import { HttpClient } from '@angular/common/http';
import * as $ from 'jquery'
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';

import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { OverlayService } from 'src/app/overlay/overlay.module';
import { ProgressSpinnerComponent } from 'src/app/progress-spinner/progress-spinner.module';
import { TacOrder } from 'src/app/models/order';

// import {  } from "angular4-ravepayment";

// declare var TwoCoInlineCart: any

@Component({
  selector: 'app-order-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit, OnDestroy {

  public orderDetails: Order = {};
  public OtherDetailsPayment = {};
  public locData = {};
  config: AppConfig

  emailService = new EmailService()
  order_date = ''

  shownow = false
  o_currency = ''
  o_country = ''
  flutterWaveKey = environment.flutter_wave_public_key
  reference = 0
  flwCurr = ''
  isFlutterWave = false
  is2co = false
  hasPaid = false

  isReloaded = false
  isError = false
  retry_url = ''

  display_div = true
  isErrorOccurred = false

  constructor(private toastrService: ToastrService, private orderService: OrderService, public productsService: ProductsService, public cartService: CartService, private http: HttpClient, private exportAsService: ExportAsService, private previewProgressSpinner: OverlayService) {
    this.config = new AppConfig(productsService)
  }

  date = new Date()
  months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  getDateNow() {
    return `${this.months[this.date.getUTCMonth()]} ${this.date.getUTCDate()}, ${this.date.getUTCFullYear()}`
  }

  /**
   * this method sets up 2checkout scripting for payment processing
   */
  //here
  setup2checkout(conversion_used: number) {
    //const orderDetails = this.orderService.getOrderItems();
    //const locData = this.orderService.getLocationData()
    const ps = this.productsService
    // const cs = this.cartService.getItems()
    const cs = this.orderDetails.product
    const ac = this.config
    const currency = (this.locData['currency'] == '₦') ? 'NGN' : this.locData['currency']
    const products = []
    // cs.subscribe(c => {
    cs.forEach(cart => {
      products.push({
        name: `${cart.product.name}`,
        quantity: cart.quantity,
        price: (conversion_used == null) ? ac.convertPrice(cart.product.price) : Number((cart.product.price / conversion_used).toFixed(2)),
        externalReference: `${cart.product.id}`,
        tangible: false,
        type: 'PRODUCT',
      })
    })
    // })
    //TwoCoInlineCart.shipping.reset();http://localhost:4200/home/checkout/success?orderrefno=223813489&orderkey=-LzkgE3--PBy4zSLn99s8
    const scriptContent = `
    <script type="text/javascript">
    var paynow = (function(){
      TwoCoInlineCart.setup.setMerchant('250265504666');
      TwoCoInlineCart.setup.setMode('DYNAMIC');
      TwoCoInlineCart.cart.setTest(false);
      TwoCoInlineCart.cart.setCurrency('${currency}');
      TwoCoInlineCart.register();
      TwoCoInlineCart.products.addMany(${JSON.stringify(products)});
      TwoCoInlineCart.billing.setData({
        name: '${this.orderDetails.shippingDetails.firstname} ${this.orderDetails.shippingDetails.lastname}', 
        email: '${this.orderDetails.shippingDetails.email}', 
        phone: '${this.orderDetails.shippingDetails.phone}', 
        country: '${ps.country_code}', 
        city: '', 
        state: '', 
        zip: '', 
        address: '', 
        address2: ''
      });
      TwoCoInlineCart.shipping.setData({
        name    : '${this.orderDetails.shippingDetails.fullname}',
        country : 'NG',
        email   : '${this.orderDetails.shippingDetails.email}',
        city    : '${this.orderDetails.shippingDetails.state}',
        state   : '${this.orderDetails.shippingDetails.state}',
        zip     : '100001',
        phone   : '${this.orderDetails.shippingDetails.recipientphone}',
        address : '${this.orderDetails.shippingDetails.address}',
        address2: ''
      });
      TwoCoInlineCart.cart.setSource('Web');
      TwoCoInlineCart.cart.setCustomerReference('${this.orderDetails.shippingDetails.specialinstructions}');
      TwoCoInlineCart.cart.setOrderExternalRef('${this.orderDetails.orderId}');
      TwoCoInlineCart.cart.setCartLockedFlag(true);
      TwoCoInlineCart.cart.setReturnMethod({
        type: 'redirect',
        url : 'https://tacgifts.com/home/checkout/success'
      });
      TwoCoInlineCart.cart.checkout();
    });
    </script>
    `
    /** ?payment_key=${key}
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.innerText = scriptContent
    
    const scriptContent = `
    <script type="text/javascript">
    var paynow = (function(){
      TwoCoInlineCart.setup.setMerchant('250265504666');
      TwoCoInlineCart.setup.setMode('DYNAMIC');
      TwoCoInlineCart.cart.setCurrency('NGN');
      TwoCoInlineCart.register();
      TwoCoInlineCart.products.add({
        name: 'GIFT BASKET 1',
        quantity: 2,
        price: 30000,
        externalReference: 67498242,
        tangible: true,
        type: 'PRODUCT',
      });
      TwoCoInlineCart.products.add({
        name: 'GIFT BASKET 2',
        quantity: 1,
        price: 15000,
        externalReference: 427492490,
        tangible: true,
        type: 'PRODUCT',
      });
      TwoCoInlineCart.products.add({
        name: 'GIFT BASKET 3',
        quantity: 4,
        price: 40000,
        externalReference: 92048204,
        tangible: true,
        type: 'PRODUCT',
      });
      TwoCoInlineCart.billing.setData({
        name: 'GISANRIN ADETAYO', 
        email: 'gisanrinadetayo@gmail.com', 
        phone: '+2348100865962', 
        country: 'NG', 
        city: '', 
        state: '', 
        zip: '', 
        address: '', 
        address2: ''
      });
      TwoCoInlineCart.shipping.setData({
        name    : 'GISANRIN ADETAYO',
        country : 'NG',
        email   : 'gisanrinadetayo@gmail.com',
        city    : '',
        state   : 'Lagos',
        zip     : '100001',
        phone   : '+2348100865962',
        address : 'LEKKI',
        address2: ''
      });
      TwoCoInlineCart.cart.setSource('Web');
      TwoCoInlineCart.cart.setCustomerReference('NOTHING');
      TwoCoInlineCart.cart.setOrderExternalRef(12434242);
      TwoCoInlineCart.cart.setCartLockedFlag(true);
      TwoCoInlineCart.cart.setTest(true);
      TwoCoInlineCart.cart.checkout();
    });
    </script>
    `
    */

    $('#paymentW').append(scriptContent)
    $('#paymentW').append("<button id='paynowbutton' type='button' onclick='paynow()'>PayNow</button>")

    // window.addEventListener('load', function () {
    //   $('#paynowbutton').click()
    // });

    /** 
    TwoCoInlineCart.setup.setMerchant('250265504666'); // your Merchant code
      TwoCoInlineCart.setup.setMode('DYNAMIC');
      TwoCoInlineCart.cart.setCurrency(`${currency}`);
      TwoCoInlineCart.register();
      cs.subscribe(c => {
        c.forEach(cart => {
          TwoCoInlineCart.products.add({
            name: `${cart.product.name}`,
            quantity: cart.quantity,
            price: ac.convertPrice(cart.product.price),
            externalReference: `${cart.product.id}`,
            tangible: true,
            type: 'PRODUCT',
          });
        })
      })
      TwoCoInlineCart.billing.setData({
        name: `${orderDetails.shippingDetails.firstname} ${orderDetails.shippingDetails.lastname}`, 
        email: `${orderDetails.shippingDetails.email}`, 
        phone: `${orderDetails.shippingDetails.phone}`, 
        country: `${ps.country_code}`, 
        city: '', 
        state: '', 
        zip: '', 
        address: '', 
        address2: ''
      });
      TwoCoInlineCart.shipping.setData({
        name    : `${orderDetails.shippingDetails.fullname}`,
        country : 'NG',
        email   : `${orderDetails.shippingDetails.email}`,
        city    : '',
        state   : 'Lagos',
        zip     : '100001',
        phone   : `${orderDetails.shippingDetails.recipientphone}`,
        address : `${orderDetails.shippingDetails.address}`,
        address2: ''
      });
      TwoCoInlineCart.cart.setSource('Web');
      TwoCoInlineCart.cart.setCustomerReference(`${orderDetails.shippingDetails.specialinstructions}`);
      TwoCoInlineCart.cart.setOrderExternalRef(`${orderDetails.orderId}`);
      TwoCoInlineCart.cart.setCartLockedFlag(true);
      // TwoCoInlineCart.cart.setReturnMethod({
      //   type: 'redirect',
      //   url : 'http://localhos'
      // });
      TwoCoInlineCart.cart.setTest(true);
      TwoCoInlineCart.cart.checkout();
      */
  }

  /**
   * using jquery to trigger a click action
   */
  paynowClicked() {
    $('#paynowbutton').click()
  }

  /**
   * While using flutterwave as a payment gateway,
   * this method specifies the country code to be used for some african currencies
   */
  setupCurrencyAndCountry() {
    this.o_currency = (this.productsService.currency == '₦') ? 'NGN' : this.productsService.currency
    this.o_country = this.productsService.country_code
    switch (this.o_currency) {
      case 'KES':
        this.o_country = 'KE';
        break;
      case 'GHS':
        this.o_country = 'GH';
        break;
      case 'ZAR':
        this.o_country = 'ZA';
        break;
      case 'TZS':
        this.o_country = 'TZ';
        break;

      default:
        this.o_country = 'NG';
        break;
    }
    return this.o_country
  }

  /**
   * Upon redirection of the payment gateway used,
   * this method determines which payment gateway way used and process its
   * verification process by connecting to firebase cloud functions.
   * Also upon ngOnInit(), it determines which payment gateway to be used from the
   * currency the customer is using
   * @param currency 
   */
  async checkURLStatus(currency: string) {
    const key = localStorage.getItem('currentOrder')
    if (this.getUrlParameter('resp') != null) {
      //process flutter wave
      this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
      const flw_resp = JSON.parse(this.getUrlParameter('resp'))
      const _tx = flw_resp['tx']
      const ref = _tx['txRef']
      const order = await firebase.firestore().collection('orders').doc(key).get()
      if (order.data() == null) {
        this.previewProgressSpinner.close()
        location.href = "/404"
        this.isError = true
        this.toastrService.error('An error occurred. Please try again.');
        return
      }
      const mOrder = <TacOrder>order.data()
      const order_currency = (mOrder.currency_used == '₦') ? 'NGN' : mOrder.currency_used
      const order_amount = mOrder.total_amount
      this.retry_url = mOrder.retry_url
      this.http.get(`https://us-central1-taconlinegiftshop.cloudfunctions.net/verifyTransaction?ref=${ref}`, { headers: { "Authorization": "api ATCNoQUGOoEvTwqWigCR" } }).toPromise().then(async res => {
        // const err = res['status']
        if (res['error'] != null) {
          this.previewProgressSpinner.close()
          this.isError = true
          this.toastrService.error('Payment not successful. Please try again.');
          return
        }
        const data = res['data']
        const message = data['status']
        const cc = data['chargecode']
        const amt = data['amount']
        const curr = data['currency']
        const appfee = data['appfee']
        const _mf = data['amountsettledforthistransaction']

        this.retry_url = `https://tacgifts.com/home/checkout/success?orderrefno=${ref}&orderkey=${mOrder.id}`

        if (message == 'successful' && (cc == '00' || cc == '0') && amt == order_amount && order_currency == curr) {
          await firebase.firestore().collection('orders').doc(key).update(
            {
              'payment_gateway_fee': appfee,
              'payment_gateway_used': 'flutterwave',
              'payment_status': 'paid',
              'merchant_fee': _mf,
              'other_payment_details.tax': Number(((_mf * mOrder.other_payment_details['tax_value']) / 100).toFixed(2)),
              'retry_url': `https://tacgifts.com/home/checkout/success?orderrefno=${ref}&orderkey=${mOrder.id}`,
              'transaction_id': Number(ref)
            }
          )
          this.isReloaded = true
          localStorage.removeItem('currentOrder')
          localStorage.removeItem('_item')
          localStorage.removeItem('other_payment_detals')
          localStorage.removeItem('locationData')
          this.postPaymentVerified(mOrder, ref)
        } else {
          this.previewProgressSpinner.close()
          this.isError = true
          this.toastrService.error('Payment not successful. Please try again.');
        }
      }).catch(err => {
        this.previewProgressSpinner.close()
        this.isError = true
        this.toastrService.error('An error occured');
      })
      return
    }
    if (this.getUrlParameter('refno') != null) {
      //process 2co
      this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
      const ref = this.getUrlParameter('refno')
      const order = await firebase.firestore().collection('orders').doc(key).get()
      if (order.data() == null) {
        this.previewProgressSpinner.close()
        location.href = "/404"
        this.isError = true
        this.toastrService.error('An error occurred. Please try again.');
        return
      }
      const mOrder = <TacOrder>order.data()
      const order_currency = (mOrder.currency_used == '₦') ? 'NGN' : mOrder.currency_used
      const order_amount = mOrder.total_amount

      this.retry_url = mOrder.retry_url
      //console.log(`url == ${this.retry_url}`)

      this.http.get(`https://us-central1-taconlinegiftshop.cloudfunctions.net/verify2CheckoutTransaction?ref=${ref}`, { headers: { "Authorization": "api ATCNoQUGOoEvTwqWigCR" } }).toPromise().then(async resp => {

        if (resp['error'] != null) {
          this.previewProgressSpinner.close()
          this.isError = true
          this.toastrService.error('Payment not successful. Please try again.');
          return
        }

        const res = resp['result']
        const status = res['Status']
        const _as = res['ApproveStatus']
        const vas = res['VendorApproveStatus']
        const appfee = res['AvangateCommission']
        const _mf = mOrder.total_amount - appfee

        const extra = res['ExtraInformation']
        //this.retry_url = extra['RetryFailedPaymentLink']

        //console.log(`status = ${status}\n_as = ${_as}\nvas = ${vas}`)
        //status == "COMPLETE" || status == "AUTHRECEIVED" && _as == "OK" || _as == "WAITING" && 
        if ((status == "COMPLETE" || status == "AUTHRECEIVED") && (_as == "OK" || _as == "WAITING") && vas == "OK") {
          await firebase.firestore().collection('orders').doc(key).update(
            {
              'payment_gateway_fee': appfee,
              'payment_gateway_used': '2checkout',
              'payment_status': 'paid',
              'merchant_fee': _mf,
              'other_payment_details.tax': Number(((_mf * mOrder.other_payment_details['tax_value']) / 100).toFixed(2)),
              'retry_url': this.retry_url,
              'transaction_id': Number(ref)
            }
          )
          this.isReloaded = true
          localStorage.removeItem('currentOrder')
          localStorage.removeItem('_item')
          localStorage.removeItem('other_payment_detals')
          localStorage.removeItem('locationData')
          this.postPaymentVerified(mOrder, ref)
        } else {
          this.previewProgressSpinner.close()
          this.isError = true
          this.toastrService.error('Payment not successful. Please try again.');
        }
      }).catch(err => {
        console.log(err)
        this.previewProgressSpinner.close()
        this.isError = true
        this.toastrService.error('An error occured');
      })
      return
    }

    if (currency == "NGN" || currency == "KES" || currency == "GHS" || currency == "ZAR" || currency == "TZS") {
      this.isFlutterWave = true
      this.is2co = false
    } else {
      this.is2co = true
      this.isFlutterWave = false
      this.setup2checkout(this.locData['exchange_rate'])
    }
  }

  retryUrl() {
    location.href = this.retry_url
  }

  ngOnInit() {
    $('#prescript').append(`<!-- 2checkout integration-->
    <script>
        (function (document, src, libName, config) {
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            var firstScriptElement = document.getElementsByTagName('script')[0];
            script.onload = function () {
                for (var namespace in config) {
                    if (config.hasOwnProperty(namespace)) {
                        window[libName].setup.setConfig(namespace, config[namespace]);
                    }
                }
                window[libName].register();
            };
    
            firstScriptElement.parentNode.insertBefore(script, firstScriptElement);
        })(document, 'https://secure.2checkout.com/checkout/client/twoCoInlineCart.js', 'TwoCoInlineCart', { "app": { "merchant": "250265504666", "iframeLoad": "checkout" }, "cart": { "host": "https:\/\/secure.2checkout.com", "customization": "inline" } });
    </script>
    <!-- end 2checkout integration-->
    <script src="https://api.ravepay.co/flwv3-pug/getpaidx/api/flwpbf-inline.js"></script>
    `)
    /**
     * if the customer open a new success page with the available parameters provided
     */
    if (this.getUrlParameter('orderkey') != null) {
      this.display_div = false
      this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
      const key = this.getUrlParameter('orderkey')
      // this.reference = Number(this.getUrlParameter('refno'))
      firebase.firestore().collection('orders').doc(key).get().then(order => {
        this.previewProgressSpinner.close()
        if (order.data() == null) {
          this.orderDetails = {}
          this.OtherDetailsPayment = {}
          this.locData = {}
          location.href = "/404"
          return
        }
        const mOrder = <TacOrder>order.data()
        if (mOrder.payment_status == 'paid') {
          this.display_div = false
          this.isReloaded = true
          setTimeout(() => {
            location.href = '/home'
          }, 3000)
          return
        }
        this.display_div = true
        localStorage.setItem('currentOrder', mOrder.id)
        const item: Order = {
          shippingDetails: mOrder.shipping_details,
          product: mOrder.carts,
          orderId: mOrder.transaction_id,
          totalAmount: mOrder.total_amount,
          tracking_id: mOrder.track_id
        }
        const other_payment_details = {
          tax_value: mOrder.other_payment_details['tax_value'],
          tax: mOrder.other_payment_details['tax'],
          delivery: mOrder.other_payment_details['delivery'],
          delivery_type: mOrder.other_payment_details['delivery_type']
        }
        const locationData = {
          currency: mOrder.currency_used,
          country: mOrder.country,
          exchange_rate: mOrder.conversion_rate,
          payment_gateway_fee: mOrder.payment_gateway_fee,
          mf: mOrder.merchant_fee
        }
        this.orderDetails = item
        this.OtherDetailsPayment = other_payment_details
        this.locData = locationData
        this.order_date = mOrder.created_date

        this._postInit()
      })
      return
    }

    $('.cart_qty_cls').text("0")
    this.order_date = this.getDateNow()

    /**
     * when the customer is routed from the checkout page to the success page
     */
    this.orderDetails = this.orderService.getOrderItems();
    this.OtherDetailsPayment = this.orderService.getOtherItems()
    this.locData = this.orderService.getLocationData()

    /**
     * if the customer refreshes the success page before making payment
     */
    if (this.orderService.getOrderItems() == null || (this.getUrlParameter('resp') == null || this.getUrlParameter('refno') == null)) {
      this.orderDetails = JSON.parse(localStorage.getItem('_item'))
      this.OtherDetailsPayment = JSON.parse(localStorage.getItem('other_payment_detals'))
      this.locData = JSON.parse(localStorage.getItem('locationData'))

      this._postInit()
    } else {
      this._postInit()
    }



  }

  _postInit() {
    this.reference = this.orderDetails.orderId
    if (this.orderDetails != null) {
      this.updateStockLevelForProduct()
    }
    this.flwCurr = (this.locData['currency'] == '₦') ? 'NGN' : this.locData['currency']
    this.checkURLStatus(this.flwCurr)
  }

  /**
   * Fluttterwave payment done event trigger
   * @param fw 
   */
  async paymentDone(fw: any) {
    const key = localStorage.getItem('currentOrder')
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
    const order = await firebase.firestore().collection('orders').doc(key).get()
    if (order == null) {
      this.previewProgressSpinner.close()
      this.toastrService.error('An error occurred. Please try again.');
      return
    }
    const mOrder = <TacOrder>order.data()
    const order_currency = (mOrder.currency_used == '₦') ? 'NGN' : mOrder.currency_used
    const order_amount = mOrder.total_amount
    this.http.get(`https://us-central1-taconlinegiftshop.cloudfunctions.net/verifyTransaction?ref=${this.reference}`, { headers: { "Authorization": "api ATCNoQUGOoEvTwqWigCR" } }).toPromise().then(async res => {

      if (res['error'] != null) {
        this.previewProgressSpinner.close()
        this.reference = this.randomInt(1, 999999999)
        this.toastrService.error('Payment not successful. Please try again.');
        return
      }
      const data = res['data']
      const message = data['status']
      const cc = data['chargecode']
      const amt = data['amount']
      const curr = data['currency']
      const appfee = data['appfee']
      const _mf = data['amountsettledforthistransaction']

      if (message == 'successful' && (cc == '00' || cc == '0') && amt == order_amount && order_currency == curr) {
        await firebase.firestore().collection('orders').doc(key).update(
          {
            'payment_gateway_fee': appfee,
            'payment_gateway_used': 'flutterwave',
            'payment_status': 'paid',
            'merchant_fee': _mf,
            'other_payment_details.tax': Number(((_mf * mOrder.other_payment_details['tax_value']) / 100).toFixed(2)),
            'retry_url': `https://tacgifts.com/home/checkout/success?orderrefno=${this.reference}&orderkey=${mOrder.id}`,
            'transaction_id': this.reference
          }
        )
        this.orderDetails = null
        this.locData = null
        this.OtherDetailsPayment = null
        this.isReloaded = true
        this.previewProgressSpinner.close()
        localStorage.removeItem('currentOrder')
        localStorage.removeItem('_item')
        localStorage.removeItem('other_payment_detals')
        localStorage.removeItem('locationData')
        this.postPaymentVerified(mOrder, `${this.reference}`)
      } else {
        this.previewProgressSpinner.close()
        this.reference = this.randomInt(1, 999999999)
        this.toastrService.error('Payment not successful. Please try again.');
      }
    }).catch(err => {
      this.previewProgressSpinner.close()
      this.reference = this.randomInt(1, 999999999)
      this.toastrService.error('An error occured');
    })
  }

  /**
   * 
   * @param curr 
   * @param value 
   */
  formatNumbers(curr: string, value: number) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2
    })
    return formatter.format(value)
  }

  /**
   * After payment has been made, this method processes the
   * customer details and information on payment to be processed next
   * in uploadPDFToFirebase method
   * @param order 
   * @param tranaction_id 
   */
  postPaymentVerified(order: TacOrder, tranaction_id: string) {
    const curr = (order.currency_used == '₦') ? 'NGN' : order.currency_used
    //send email automaticatlly
    const billing_name = `${order.shipping_details['firstname']} ${order.shipping_details['lastname']}`

    const currency_total_amount = this.formatNumbers(curr, order.total_amount)//`${curr}${order.total_amount}`
    const trans_id = (tranaction_id == null) ? order.transaction_id : tranaction_id

    const shipping_details = `${order.shipping_details['fullname']}
                          <br> ${order.shipping_details['address']}
                          <br> ${order.shipping_details['state']}, ${order.shipping_details['country']}<br>
                          Contact No. ${order.shipping_details['recipientphone']}`

    const currency_shipping_fee = `${curr}0.00`//${this.OtherDetailsPayment['delivery']}`
    const currency_tax_fee = `Tax Inclusive`//`${curr}${this.OtherDetailsPayment['tax']}`

    var cart_items = ''
    const exchangeR = order.conversion_rate

    // this.cartService.getItems().subscribe(mCart => {
    order.carts.forEach(cart => {
      const unit_price = this.formatNumbers(curr, (cart.product.price / exchangeR)) //${curr}${(cart.product.price / exchangeR).toFixed(2)}
      const sub_total_price = this.formatNumbers(curr, ((cart.product.price * cart.quantity) / exchangeR))//${curr}${((cart.product.price * cart.quantity) / exchangeR).toFixed(2)}
      cart_items += `<tr>
    <td width="50%"
        class="m_-7433457280851606022ordered-item-label-td m_-7433457280851606022product"
        style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse">
        ${cart.quantity} x ${cart.product.name} </td>
    <td align="right" width="25%"
        class="m_-7433457280851606022ordered-item-unit-price-td"
        style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse;text-align:right">
        ${unit_price}
    </td>
    <td align="right" width="25%"
        class="m_-7433457280851606022ordered-item-cost-td"
        style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse;text-align:right">
        ${sub_total_price}
    </td>
    </tr>`
    })
    // })
    const email_body = this.emailService.getBody(this.getDateNow(), billing_name, currency_total_amount, trans_id, shipping_details, currency_shipping_fee, currency_tax_fee, cart_items, `${order.track_id}`)
    const email = order.shipping_details['email']
    this.uploadPDFToFirebase(email_body, email, trans_id, billing_name, email_body)
  }

  /**
   * method used to generate a pdf file, send the file to firebase storage and email the customer the pdf file
   * @param body 
   * @param email 
   * @param trans_id 
   * @param billing_name 
   * @param email_body 
   */
  async uploadPDFToFirebase(body: string, email: string, trans_id: string, billing_name: string, email_body: string): Promise<any> {

    const key = firebase.database().ref().push().key
    const pk = this.previewProgressSpinner
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
          'timestamp_date': firebase.firestore.FieldValue.serverTimestamp(),
          'invoice_url': url
        }).then(done => {
          $(function () {
            $.ajax({
              url: `https://avidprintsconcierge.com/emailsending/send.php?sender_email=${email}&sender_name=${billing_name}`,
              type: "post",
              dataType: "html",
              success: function (data) {
                pk.close()
                setTimeout(() => {
                  location.href = '/home'
                }, 3000)
              },
              error: function (err) {
                pk.close()
                setTimeout(() => {
                  location.href = '/home'
                }, 3000)
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

  }

  /**
   * Returns the value of a particular url parameter key
   * @param sParam 
   * @returns string
   */
  getUrlParameter(sParam: string) {
    const sPageURL = window.location.search.substring(1) //get the url parameter
    const sURLVariables = sPageURL.split('&')
    var sParameterName: string[], i: number;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? null : decodeURIComponent(sParameterName[1]);
      }
    }
  }

  /**
   * Fluttterwave cancel event trigger
   * Also generates a new reference number for payment
   */
  paymentCancel() {
    //this.reference = this.randomInt(1, 999999999)
    this.toastrService.info('Please wait...');
  }

  /**
   * 
   * @param min 
   * @param max 
   * @returns an Interger
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * @returns an obversable value of the total amount in cart
   */
  public getSubTotal(): Observable<number> {
    return this.config.convertTotalPrice(this.cartService.getTotalAmount());
  }

  /**
   * method used to clear cart on the database and to clear cart locally in browser
   */
  clearAllCartFromFirebaseAndLocalStorage() {
    this.cartService.getItems().subscribe(mCart => {
      mCart.forEach(async cart => {
        const pro = cart.product
        await firebase.firestore().collection("products-in-cart").doc(`${localStorage.getItem('unique-id-for-cart')}${pro.id}`).delete()
      })
      localStorage.setItem("cartItem", "[]")
      //location.href = "/home"
    })
  }

  /**
   * method used to update gift basket items stock on the database
   */
  updateStockLevelForProduct() {
    this.cartService.getItems().subscribe(mCart => {
      mCart.forEach(cart => {
        this.productsService.getProduct(cart.product.id).subscribe(pro => {
          const pro_items = pro.items
          pro_items.forEach(async item => {
            if (item.id != null) {
              this.runFireStoreTransaction(item.id)
            }
          })
        })
      })
      this.clearAllCartFromFirebaseAndLocalStorage()
    })
  }

  /**
   * Firebase decrement update
   * @param id 
   */
  runFireStoreTransaction(id: string) {
    const itemRef = firebase.firestore().collection('db').doc('tacadmin').collection('items').doc(id).update({ 'stock_level': firebase.firestore.FieldValue.increment(-1) })
    // const trans = firebase.firestore().runTransaction(async t => {
    //   const doc = await t.get(itemRef);
    //   let newstock_level = doc.data().stock_level - 1;
    //   t.update(itemRef, { stock_level: newstock_level });//firebase.firestore.FieldValue.increment(-1)
    // })
  }


  // // const curr = (this.productsService.currency == '₦') ? 'NGN' : this.productsService.currency
  // const curr = (this.locData['currency'] == '₦') ? 'NGN' : this.locData['currency']
  // //send email automaticatlly
  // const billing_name = `${this.orderDetails.shippingDetails.firstname} ${this.orderDetails.shippingDetails.lastname}`
  // // const currency_total_amount = `${curr}${this.config.convertPrice(this.orderDetails.totalAmount)}`
  // const currency_total_amount = `${curr}${this.orderDetails.totalAmount}`
  // const trans_id = this.orderDetails.orderId
  // const shipping_details = `${this.orderDetails.shippingDetails.fullname}
  //                       <br> ${this.orderDetails.shippingDetails.address}
  //                       <br> ${this.orderDetails.shippingDetails.state}, ${this.orderDetails.shippingDetails.country}<br>
  //                       Contact No. ${this.orderDetails.shippingDetails.recipientphone}`
  // // const currency_shipping_fee = `${curr}${this.config.convertPrice(this.OtherDetailsPayment['delivery'])}`
  // // const currency_tax_fee = `${curr}${this.config.convertPrice(this.OtherDetailsPayment['tax'])}`
  // const currency_shipping_fee = `${curr}${this.OtherDetailsPayment['delivery']}`
  // const currency_tax_fee = `${curr}${this.OtherDetailsPayment['tax']}`
  // const taxValue = this.OtherDetailsPayment['tax_value']

  // var cart_items = ''
  // //${curr}${this.config.convertPrice((cart.product.price - ((cart.product.price * taxValue) / 100)))}
  // //${curr}${this.config.convertPrice((cart.product.price - ((cart.product.price * taxValue) / 100))) * cart.quantity}
  // this.cartService.getItems().subscribe(mCart => {
  //   mCart.forEach(cart => {
  //     cart_items += `<tr>
  // <td width="50%"
  //     class="m_-7433457280851606022ordered-item-label-td m_-7433457280851606022product"
  //     style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse">
  //     ${cart.quantity} x ${cart.product.name} </td>
  // <td align="right" width="25%"
  //     class="m_-7433457280851606022ordered-item-unit-price-td"
  //     style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse;text-align:right">
  //     ${curr}${this.config.convertPrice(cart.product.price)}
  // </td>
  // <td align="right" width="25%"
  //     class="m_-7433457280851606022ordered-item-cost-td"
  //     style="padding-top:10px;padding-bottom:10px;border-top:1px solid #cccccc;border-bottom:1px solid #cccccc;font-family:arial;font-size:12px;color:#333333;border-collapse:collapse;text-align:right">
  //     ${curr}${this.config.convertPrice(cart.product.price) * cart.quantity}
  // </td>
  // </tr>`
  //   })
  // })

}
