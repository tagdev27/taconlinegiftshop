import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
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
export class SettingsComponent implements OnInit, AfterViewInit {

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
    this.show = true
    setTimeout(()=>{
      const input = <HTMLInputElement>document.getElementById("searchinputquery");
      input.addEventListener("keyup", function(event){
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          const button = <HTMLButtonElement>document.getElementById("searchbuttonclicked");
          button.click();
        }
      });
    }, 500)
    
    //location.href = "home/search"
    //this.router.navigate(["home/search"])
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

  ngAfterViewInit() {
    
  }

  onSearchPressed() {
    this.display_error = false
    const result: string[] = []
    this.categories.forEach(subcat => {
      //console.log(subcat.meta)
      if (subcat.meta.toLowerCase().includes(this.query.toLowerCase()) || subcat.name.toLowerCase().includes(this.query.toLowerCase()) || subcat.description.toLowerCase().includes(this.query.toLowerCase())) {
        //console.log('yassss')
        result.push('okay')
        // this.router.navigate([`/home/collection/${subcat.id}`])
        this.show = false;
        let re = /\ /gi;
        const url_path_name = subcat.name.toLowerCase().replace(re, '-')
        this.router.navigate([`/home/collection/${url_path_name}`])
      }
    })
    if(result.length == 0){
      this.productsService.getProducts().subscribe(pro => {
        pro.forEach(async p => {
          if(p.name.toLowerCase().includes(this.query.toLowerCase())){
            this.show = false
            const subc = await this.getSubCategoryByID(p.category.split(',')[0])
            if(subc == null){
              this.display_error = true
              return
            }
            this.show = false;
            let re = /\ /gi;
            const url_path_name = subc.name.toLowerCase().replace(re, '-')
            this.router.navigate([`/home/collection/${url_path_name}`])
            result.push('okay')
          }
        })
        if(result.length == 0){
          this.display_error = true
        }
      })
    }
  }

  async getSubCategoryByID(id:string) {
    const query = await firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').doc(id).get()
    if(query.exists){
      return <SubCategory>query.data()
    }else {
      return null
    }
  }

}
