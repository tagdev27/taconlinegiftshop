import { Component, OnInit, ElementRef } from '@angular/core';
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
import * as firebase from 'firebase';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  // form group
  public checkoutForm: FormGroup;
  public cartItems: Observable<CartItem[]> = of([]);
  public checkOutItems: CartItem[] = [];
  public orderDetails: any[] = [];
  public amount: number;
  public payPalConfig?: PayPalConfig;

  showDummy = false
  reference = this.randomInt(1, 999999999)
  selected_card_style = ''
  //character_left = 450 - this.message.length
  card_styles: Styles[] = []

  config: AppConfig
  // Form Validator
  constructor(private fb: FormBuilder, private cartService: CartService,
    public productsService: ProductsService, private orderService: OrderService, private elementRef: ElementRef) {
    this.config = new AppConfig(productsService)
    this.checkoutForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      lastname: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]+')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.maxLength(50)]],
      country: ['', Validators.required],
      town: ['', Validators.required],
      state: ['', Validators.required],
      card_message: ['', [Validators.maxLength(250)]],
      specialinstructions: ['']
      //postalcode: ['', Validators.required]
    })
    //this.character_left = 450 - `${this.checkoutForm.value.card_message}`.length
  }

  getRemainingCharacter() {
    return 250 - `${this.checkoutForm.value.card_message}`.length
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  slickInit(e){}

  ngOnInit() {
    this.cartItems = this.cartService.getItems();
    this.cartItems.subscribe(products => this.checkOutItems = products);
    this.getTotal().subscribe(amount => this.amount = amount);
    this.initConfig();
    //this.card_styles = JSON.parse(localStorage.getItem("card_styles"))
  }

  selectCardStyle(id: any) {
    this.selected_card_style = `- ${id} selected`
  }

  // Get sub Total
  public getTotal(): Observable<number> {
    return this.config.convertTotalPrice(this.cartService.getTotalAmount());
  }

  // stripe payment gateway
  stripeCheckout() {
    var handler = (<any>window).StripeCheckout.configure({
      key: 'pk_test_mXCVfFRwmNqgqmZnKqgVmiW1', // publishble key
      locale: 'auto',
      currency: (this.productsService.country == 'Nigeria') ? 'NGN' : `${this.productsService.currency}`,
      token: (token: any) => {
        // You can access the token ID with `token.id`.
        // Get the token ID to your server-side code for use.
        this.orderService.createOrder(this.checkOutItems, this.checkoutForm.value, token.id, this.config.convertPrice(this.amount), this.selected_card_style);
      }
    });
    handler.open({
      name: 'TAC',
      description: 'Online Gift Store',
      email: this.checkoutForm.value.email,
      amount: this.config.convertPrice(this.amount) * 100
    })
  }

  // Paypal payment gateway
  private initConfig(): void {
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
        this.orderService.createOrder(this.checkOutItems, this.checkoutForm.value, data.orderID, this.config.convertPrice(this.amount), this.selected_card_style);
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

  paymentCancel() {
    this.config.displayMessage("Payment cancelled", false)
  }

  paymentDone(paystackData: any) {
    const status = paystackData['status'];
    const message = paystackData['message'];
    const trans = paystackData['trans'];
    this.orderService.createOrder(this.checkOutItems, this.checkoutForm.value, trans, this.config.convertPrice(this.amount), this.selected_card_style);
  }

  public slideNavConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true
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

}
