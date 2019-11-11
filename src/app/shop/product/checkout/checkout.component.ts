import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PayPalConfig, PayPalEnvironment, PayPalIntegrationType } from 'ngx-paypal';
// import {  IPayPalConfig,  ICreateOrderRequest } from 'ngx-paypal';
import { CartItem } from '../../../shared/classes/cart-item';
import { ProductsService } from '../../../shared/services/products.service';
import { CartService } from '../../../shared/services/cart.service';
import { OrderService } from '../../../shared/services/order.service';
import { Observable, of } from 'rxjs';
import { AppConfig } from 'src/app/services/global.service';
import { Styles } from 'src/app/models/style';
import * as firebase from "firebase";
import { MainCategory } from 'src/app/models/main.category';
import { SubCategory } from 'src/app/models/sub.category';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { OverlayService } from 'src/app/overlay/overlay.module';
import { ProgressSpinnerComponent } from 'src/app/progress-spinner/progress-spinner.module';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

declare interface Messages {
  id: string;
  category: string;
  text: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  showPaymentOption = false
  // form group
  public checkoutForm: FormGroup;
  public cartItems: Observable<CartItem[]> = of([]);
  public checkOutItems: CartItem[] = [];
  public orderDetails: any[] = [];
  public amount: number;
  fixed_amount: number;
  public tax_amount: number = 0
  // public delivery_amount: number = 2000
  delivery_amount: number = 0
  //other countries amount
  public other_country_amount = 0

  public payPalConfig?: PayPalConfig;

  showDummy = false
  reference = this.randomInt(1, 999999999)
  selected_card_style = ''
  //character_left = 450 - this.message.length
  card_styles: Styles[] = []

  config: AppConfig
  selected_delivery_name = ''

  payK = environment.paystack_key
  flutterWaveKey = environment.flutter_wave_public_key

  o_currency = ''
  o_country = ''

  gift_card_section = false

  // Form Validator
  constructor(private http: HttpClient, private fb: FormBuilder, private cartService: CartService, private modalService: NgbModal,
    public productsService: ProductsService, private orderService: OrderService, private elementRef: ElementRef, private previewProgressSpinner: OverlayService) {
    this.config = new AppConfig(productsService)
    this.checkoutForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      lastname: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]+')]],
      email: ['', [Validators.required, Validators.email]],
      fullname: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      recipientphone: ['', [Validators.required, Validators.pattern('[0-9]+')]],
      address: ['', [Validators.required, Validators.maxLength(250)]],
      country: ['', Validators.required],
      town: ['', Validators.required],
      state: ['', Validators.required],
      card_message: ['', [Validators.maxLength(250)]],
      specialinstructions: ['']
      //postalcode: ['', Validators.required]
    })
    //this.character_left = 450 - `${this.checkoutForm.value.card_message}`.length
  }

  getTaxValue() {
    firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('tax').get().then(snap => {
      const tax: number = snap.data()['tax_value']
      this.cartService.getTotalAmount().subscribe(subtotal => {
        this.tax_amount = (subtotal * tax) / 100
        //this.amount = (this.productsService.country == 'Nigeria') ? (this.amount + this.tax_amount) : (this.amount + this.tax_amount) * 100
        this.amount = (this.amount + this.tax_amount)
        this.fixed_amount = this.amount
        //this.other_country_amount = Number.parseInt((this.amount*100).toFixed())
      })
    })
  }

  deliveryMethodChange(del_amt: number, del_name: string) {
    this.selected_delivery_name = del_name
    this.delivery_amount = del_amt
    this.amount = this.fixed_amount + del_amt
  }

  getRemainingCharacter() {
    return 250 - `${this.checkoutForm.value.card_message}`.length
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  slickInit(e) { }

  async checkIfLoggedIn(){
    const anon = localStorage.getItem("signInAnonymously")
    const logged = localStorage.getItem("logged")
    if(logged == null || logged == "false"){
       if(anon == "true"){
          return
       }
      await firebase.auth().signInAnonymously()
      localStorage.setItem("signInAnonymously", "true")
    }
 }

  ngOnInit() {
    this.checkIfLoggedIn()
    this.checkoutForm.controls['firstname'].setValue((localStorage.getItem('fn') != null) ? localStorage.getItem('fn') : '')
    this.checkoutForm.controls['lastname'].setValue((localStorage.getItem('ln') != null) ? localStorage.getItem('ln') : '')
    this.checkoutForm.controls['email'].setValue((localStorage.getItem('email') != null) ? localStorage.getItem('email') : '')
    this.checkoutForm.controls['phone'].setValue((localStorage.getItem('phone') != null) ? localStorage.getItem('phone') : '')

    this.cartItems = this.cartService.getItems();
    this.cartItems.subscribe(products => this.checkOutItems = products);
    // this.getTotal().subscribe(amount => this.amount = (amount + this.tax_amount + this.delivery_amount));
    this.cartService.getTotalAmount().subscribe(amount => this.amount = (amount + this.tax_amount + this.delivery_amount));
    this.getTaxValue()
    //this.initConfig();
    ////this.card_styles = JSON.parse(localStorage.getItem("card_styles"))
    
    //this.getGiftCardMessages()
    //this.getMainCategories()
  }

  ngOnDestroy() {
    if (this.previewProgressSpinner != null) {
      this.previewProgressSpinner.close()
    }
  }

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

  trackStyle(index, style) {
    //console.log(style);
    return style ? style.id : undefined;

  }

  selectCardStyle(id: any) {
    this.selected_card_style = `${id} selected`
  }

  // Get sub Total
  public getTotal(): Observable<number> {
    return this.config.convertTotalPrice(this.cartService.getTotalAmount());
  }

  // stripe payment gateway
  /*
  stripeCheckout() {
    const other_payment_detals = {
      tax: this.config.convertPrice(this.tax_amount),
      delivery: this.config.convertPrice(this.delivery_amount)
    }
    var handler = (<any>window).StripeCheckout.configure({
      key: 'pk_test_mXCVfFRwmNqgqmZnKqgVmiW1', // publishble key
      locale: 'auto',
      currency: (this.productsService.country == 'Nigeria') ? 'NGN' : `${this.productsService.currency}`,
      token: (token: any) => {
        // You can access the token ID with `token.id`.
        // Get the token ID to your server-side code for use.
        this.orderService.createOrder(this.checkOutItems, this.checkoutForm.value, other_payment_detals, token.id, this.config.convertPrice(this.amount), this.selected_card_style, null);
      }
    });
    handler.open({
      name: 'TAC',
      description: 'Online Gift Store',
      email: this.checkoutForm.value.email,
      amount: this.config.convertPrice(this.amount) * 100
    })
  }
  */

  // Paypal payment gateway
  /*
  private initConfig(): void {
    const other_payment_detals = {
      tax: this.tax_amount,
      delivery: this.delivery_amount
    }
    this.payPalConfig = new PayPalConfig(PayPalIntegrationType.ClientSideREST, PayPalEnvironment.Sandbox, {
      commit: true,
      client: {
        sandbox: 'CLIENT_ID', // client Id
      },
      button: {
        label: 'paypal',
        size: 'small',    // small | medium | large | responsive
        shape: 'rect',     // pill | rect
        //color: 'blue',   // gold | blue | silver | black
        //tagline: false  
      },
      onPaymentComplete: (data, actions) => {
        this.orderService.createOrder(this.checkOutItems, this.checkoutForm.value, other_payment_detals, data.orderID, this.config.convertPrice(this.amount), this.selected_card_style, null);
      },
      onCancel: (data, actions) => {
        this.config.displayMessage("Payment cancelled", false)
      },
      onError: (err) => {
        console.log(err);
        this.config.displayMessage("An error occurred. Please try again", false)
      },
      transactions: [{
        amount: {
          currency: this.productsService.currency,
          total: this.config.convertPrice(this.amount)
        }
      }]
    });
  }
  */
  paymentCancel() {
    this.reference = this.randomInt(1, 999999999)
    this.config.displayMessage("Payment cancelled", false)
  }

  paymentDone(paystackData: any) {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
    const order_currency = (this.productsService.currency == '₦') ? 'NGN' : this.productsService.currency
    const order_amount = this.config.convertPrice(this.amount)
    const body = {
      "txref": this.reference,
      "SECKEY": environment.flutter_wave_secret_key
    }
    this.http.post('https://api.ravepay.co/flwv3-pug/getpaidx/api/v2/verify', body, { headers: { "Content-Type": "application/json" } }).toPromise().then(res => {

      const data = res['data']
      const message = data['status']
      const cc = data['chargecode']
      const amt = data['amount']
      const curr = data['currency']
      const appfee = data['appfee']
      const _mf = data['amountsettledforthistransaction']

      if (message == 'successful' && (cc == '00' || cc == '0') && amt == order_amount && order_currency == curr) {
        //this.checkIfLoggedIn()
        const other_payment_detals = {
          tax: this.config.convertPrice(this.tax_amount),
          delivery: this.config.convertPrice(this.delivery_amount),
          delivery_type: this.selected_delivery_name
        }
        const locationData = {
          currency: this.productsService.currency,
          country: this.productsService.country,
          exchange_rate: this.productsService.exchange_rate,
          payment_gateway_fee: appfee,
          mf: _mf
        }
        /* 
        message: "Approved"
        reference: "297792363"
        status: "success"
        trans: "308244191"
        transaction: "308244191"
        trxref: "297792363"
   
        const status = paystackData['status'];
        const message = paystackData['message'];
        const trans = paystackData['trxref'];
        if (status != 'success' && message != 'Approved') {
          this.reference = this.randomInt(1, 999999999)
          this.config.displayMessage(`Payment failed. ${message}`, false)
          return
        }
         */
        const current_email = localStorage.getItem('email')
        if (current_email == null) {
          localStorage.setItem('email', this.checkoutForm.value.email)
        }
        localStorage.setItem('phone', this.checkoutForm.value.phone)
        localStorage.setItem('fn', this.checkoutForm.value.firstname)
        localStorage.setItem('ln', this.checkoutForm.value.lastname)
        this.orderService.createOrder(this.checkOutItems, this.checkoutForm.value, other_payment_detals, this.reference, this.config.convertPrice(this.amount), this.selected_card_style, locationData);
      } else {
        this.previewProgressSpinner.close()
        this.reference = this.randomInt(1, 999999999)
        this.config.displayMessage('Payment not successful. Please try again.', false)
      }

    }).catch(err => {
      this.previewProgressSpinner.close()
      this.reference = this.randomInt(1, 999999999)
      this.config.displayMessage('An error occured', false)
    })
  }

  public slideNavConfig = {
    vertical: false,
    slidesToShow: 2,
    slidesToScroll: 2,
    arrows: true,
    dots: false,
    focusOnSelect: true
  }

  getGiftCardMessages() {
    firebase.firestore().collection('db').doc('tacadmin').collection('gift-card-messages').get().then(query => {
      this.messages = []
      query.forEach(data => {
        const msg = <Messages>data.data()
        this.messages.push(msg)
      })
    });
  }

  getMainCategories() {
    firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where("deleted", "==", false).get().then(query => {
      this.card_categories = []
      query.forEach(data => {
        const category = <MainCategory>data.data()
        this.card_categories.push(category.name)
      })
      this.getSubCategories()
    });
  }

  getSubCategories() {//main_cat_id:string .where("main_category_id", "==", main_cat_id)
    firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).get().then(query => {
      query.forEach(data => {
        const category = <SubCategory>data.data()
        this.card_categories.push(category.name)
      })
    });
  }

  open(content, type, modalDimension) {
    if (modalDimension === 'sm' && type === 'modal_mini') {
      this.modalService.open(content, { windowClass: 'modal-mini', size: 'sm', centered: true }).result.then((result) => {
        this.closeResult = 'Closed with: $result';
      }, (reason) => {
        this.closeResult = 'Dismissed $this.getDismissReason(reason)';
      });
    } else if (modalDimension === '' && type === 'Notification') {
      this.modalService.open(content, { windowClass: 'modal-danger', centered: true }).result.then((result) => {
        this.closeResult = 'Closed with: $result';
      }, (reason) => {
        this.closeResult = 'Dismissed $this.getDismissReason(reason)';
      });
    } else {
      this.modalService.open(content, { centered: true }).result.then((result) => {
        this.closeResult = 'Closed with: $result';
      }, (reason) => {
        this.closeResult = 'Dismissed $this.getDismissReason(reason)';
      });
    }
  }

  ngAfterViewInit() {
    //setTimeout(())
    //this.card_styles = this.productsService.my_card_styles
    //this.getGiftCardStyles()
    // const htmlScriptElement = document.createElement('script');
    // htmlScriptElement.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
    // this.elementRef.nativeElement.appendChild(htmlScriptElement);
  }
  // { id: 1, image: "https://morethankyounotes.com/wp-content/uploads/2016/06/THANK-YOU-CARD-WORDING-EXAMPLES.jpg.webp" },
  // { id: 2, image: "https://morethankyounotes.com/wp-content/uploads/2016/06/Thank-You-Card-with-Birdie.jpg.webp" },
  // { id: 3, image: "https://morethankyounotes.com/wp-content/uploads/2017/05/Bridal-Shower-Thank-You-Card-Messages.png" }
  closeResult = ''
  messages: Messages[] = []
  selected_messages_array: Messages[] = []
  card_categories: string[] = []
  selected_category = ''
  mcard_message = ''

  @ViewChild('gifts', { static: false }) private giftMessagesContainer: ElementRef;

  giftMessages() {
    this.open(this.giftMessagesContainer, '', '')
  }

  viewMessages() {
    if (this.selected_category == '') {
      return
    }
    this.selected_messages_array = this.messages.filter((item, index, arr) => {
      return item.category.includes(this.selected_category)
    })
  }

  addMessageToField(text: string) {
    this.modalService.dismissAll()
    this.checkoutForm.controls['card_message'].setValue(text)
    //this.mcard_message = text
    //document.getElementById("mcard_message").setAttribute("value", text)// = text
    //this.checkoutForm.setValue({ 'card_message': text })
  }

}
