import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CartItem } from '../../../../shared/classes/cart-item';
import { CartService } from '../../../../shared/services/cart.service';
import { ProductsService } from '../../../../shared/services/products.service';
import { Observable, of } from 'rxjs';
import { Currency } from "../../../../models/currency";
import * as firebase from "firebase";
import { AppConfig } from 'src/app/services/global.service';
import { SubCategory } from 'src/app/models/sub.category';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-header-widgets',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Input() shoppingCartItems: CartItem[] = [];

  public show: boolean = false;
  config: AppConfig
  constructor(private router: Router, private translate: TranslateService, private cartService: CartService,
    public productsService: ProductsService) {
    this.config = new AppConfig(productsService)
  }

  currencies: Currency[] = []

  categories: SubCategory[] = []
  query = ''
  display_error = false

  ngOnInit() {
    firebase.firestore().collection('db').doc('tacadmin').collection('currency').onSnapshot(query => {
      this.currencies = []
      query.forEach(q => {
        const cur = <Currency>q.data()
        this.currencies.push(cur)
      })
    });
    this.getAllSubCategories()
  }

  public updateCurrency(curr, ex_rate) {
    if (curr == 'NGN') {
      this.productsService.currency = '₦'
      this.productsService.exchange_rate = 0
      return
    }
    this.productsService.currency = curr;
    this.productsService.exchange_rate = ex_rate;
  }

  public changeLanguage(lang) {
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

  getAllSubCategories() {
    firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).onSnapshot(query => {
      this.categories = []
      var index = 0
      query.forEach(async data => {
        const category = <SubCategory>data.data()
        this.categories.push(category)
        index = index + 1
      })
    });
  }

  onSearchPressed() {
    this.display_error = false
    const result: string[] = []
    this.categories.forEach(subcat => {
      //console.log(subcat.meta)
      if (subcat.meta.toLowerCase().includes(this.query.toLowerCase()) || subcat.name.toLowerCase().includes(this.query.toLowerCase()) || subcat.description.toLowerCase().includes(this.query.toLowerCase())) {
        //console.log('yassss')
        result.push('okay')
        this.router.navigate([`/home/left-sidebar/collection/${subcat.id}`])
      }
    })
    if(result.length == 0){
      this.display_error = true
    }
  }

}
