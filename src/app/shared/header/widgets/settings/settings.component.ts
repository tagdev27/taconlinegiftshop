import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CartItem } from '../../../../shared/classes/cart-item';
import { CartService } from '../../../../shared/services/cart.service';
import { ProductsService } from '../../../../shared/services/products.service';
import { Observable, of } from 'rxjs';
import { Currency } from "../../../../models/currency";
import * as firebase from "firebase";
import { AppConfig } from 'src/app/services/global.service';
declare var $: any;

@Component({
  selector: 'app-header-widgets',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Input() shoppingCartItems  :   CartItem[] = [];

  public show  :   boolean = false;
config:AppConfig
  constructor(private translate: TranslateService, private cartService: CartService,
   public productsService: ProductsService) { 
    this.config = new AppConfig(productsService)
   }

  currencies:Currency[] = []

  ngOnInit() { 
    firebase.firestore().collection('db').doc('tacadmin').collection('currency').onSnapshot(query => {
      this.currencies = []
      query.forEach(q => {
        const cur = <Currency>q.data()
        this.currencies.push(cur)
      })
    });
  }

  public updateCurrency(curr, ex_rate) {
    if(curr == 'NGN'){
      this.productsService.currency = '₦'
      this.productsService.exchange_rate = 0
      return
    }
    this.productsService.currency = curr;
    this.productsService.exchange_rate = ex_rate;
  }

  public changeLanguage(lang){
    this.translate.use(lang)
  }

  public openSearch() {
    this.show = true;
  }

  public closeSearch() {
    this.show = false;
  }

  public getTotal(): Observable<number> {
    return this.config.convertTotalPrice(this.cartService.getTotalAmount());
  }

  public removeItem(item: CartItem) {
    this.cartService.removeFromCart(item);
  }

}
