import { Injectable, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../classes/product';
import { BehaviorSubject, Observable, of, Subscriber } from 'rxjs';
import { map, filter, scan, count } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import * as firebase from "firebase/app";
import "firebase/firestore"
import { Currency } from 'src/app/models/currency';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as cors from "cors";
import { Banners } from 'src/app/models/banner';
import { AppConfig } from 'src/app/services/global.service';
import { Styles } from 'src/app/models/style';
import { Delivery } from 'src/app/models/delivery';
import { Menu } from "src/app/shared/header/widgets/left-menu/left-menu-items";
import * as navbar from "src/app/shared/header/widgets/navbar/navbar-items";
import { MainCategory } from 'src/app/models/main.category';
import { SubCategory } from 'src/app/models/sub.category';

// Get product from Localstorage
let products = JSON.parse(localStorage.getItem("compareItem")) || [];

@Injectable()

export class ProductsService {

  public currencies: Currency[] = []
  public banner: Banners = {}
  public user_country = {}
  public country = ''
  public country_code = ''
  //public currency : string = 'USD';
  public currency: string = '₦';
  public exchange_rate: number = 1;
  public catalogMode: boolean = false;

  public compareProducts: BehaviorSubject<Product[]> = new BehaviorSubject([]);
  public observer: Subscriber<{}>;

  FProducts: Product[] = []

  my_card_styles: Styles[] = []
  public delivery: Delivery[] = []

  public ShopDropDownMenu: navbar.Menu[] = []

  // Initialize 
  constructor(private http: Http, private toastrService: ToastrService, private mHttp: HttpClient) {
    this.compareProducts.subscribe(products => products = products);
    new AppConfig().getBanners().then(async ban => {
      // console.log(ban)
      this.banner = ban
      //await this.getMainCategoriesNavBar()
      // console.log(JSON.stringify(this.ShopDropDownMenu))
    })
    this.mHttp.get('https://ipapi.co/json', { headers: new HttpHeaders(this.apiHeaderDict) }).subscribe(res => {//https://us-central1-taconlinegiftshop.cloudfunctions.net/get_current_ip   { headers: new HttpHeaders(this.headerDict) }
      this.country = res['country_name']
      this.country_code = res['country']
      this.user_country = { latitude: res['latitude'], longitude: res['longitude'] }
      //const country = res['country']
      //console.log(`country == ${this.country}`)
      firebase.firestore().collection('db').doc('tacadmin').collection('currency').get().then(query => {//where("country", "==", country)
        this.currencies = []
        query.forEach(q => {
          const cur = <Currency>q.data()
          this.currencies.push(cur)
        })
        if (this.currencies.length > 0) {
          if (this.country != 'Nigeria') {
            const getSelectedCurrency = this.currencies.filter((item, index, arr) => {
              return item.country == this.country
            })
            if (getSelectedCurrency.length > 0) {
              this.currency = getSelectedCurrency[0].name
              this.exchange_rate = getSelectedCurrency[0].exchange_rate
            } else {
              this.currency = 'USD'
              const getSelectedCurrency = this.currencies.filter((item, index, arr) => {
                return item.name == 'USD'
              })
              this.exchange_rate = getSelectedCurrency[0].exchange_rate
            }
          }
        } else {
          this.currency = '₦'
          this.exchange_rate = 1
        }
        //console.log(`country == ${this.currency}`)
      });
    })
    //this.getGiftCardStyles()
    this.getDeliveries()
  }

  getDeliveries() {
    firebase.firestore().collection('db').doc('tacadmin').collection('delivery').get().then(query => {
      this.delivery = []
      query.forEach(data => {
        const del = <Delivery>data.data()
        this.delivery.push(del)
      })
    });
  }

  getGiftCardStyles() {
    //console.log('poped up baby')
    firebase.firestore().collection('db').doc('tacadmin').collection('gift-card-styles').onSnapshot(query => {
      this.my_card_styles = []
      query.forEach(data => {
        const st = <Styles>data.data()
        this.my_card_styles.push(st)
      })
      localStorage.setItem("card_styles", JSON.stringify(this.my_card_styles))
      //console.log(`${this.my_card_styles}`)
    });
  }

  apiHeaderDict = {
    // 'Access-Control-Allow-Origin': '*',
    // 'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS,PUT,PATCH,DELETE',
    // 'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Response-Headers',
    // 'Access-Control-Allow-Credentials': 'true',
  };

  // Observable Product Array
  private products(): Observable<Product[]> {
    //return this.http.get('assets/data/products.json').map((res: any) => res.json())
    return this.mHttp.get("https://us-central1-taconlinegiftshop.cloudfunctions.net/get_all_products?action=get", { headers: new HttpHeaders({ 'Authorization': 'api ATCNoQUGOoEvTwqWigCR'}) }).map((res: any) => res)
  }

  // Get Products
  public getProducts(): Observable<Product[]> {
    return this.products();
  }

  // Get Products By Id
  public getProduct(id: number): Observable<Product> {
    return this.products().pipe(map(items => { return items.find((item: Product) => { return item.id === id; }); }));
  }

  // Get Products By category
  public getProductByCategory(category: string): Observable<Product[]> {
    return this.products().pipe(map(items =>
      items.filter((item: Product) => {
        if (category == 'all')
          return item
        else
          //return item.category === category; 
          return item.category.includes(category);

      })
    ));
  }

  /*
     ---------------------------------------------
     ----------  Compare Product  ----------------
     ---------------------------------------------
  */

  // Get Compare Products
  public getComapreProducts(): Observable<Product[]> {
    const itemsStream = new Observable(observer => {
      observer.next(products);
      observer.complete();
    });
    return <Observable<Product[]>>itemsStream;
  }

  // If item is aleready added In compare
  public hasProduct(product: Product): boolean {
    const item = products.find(item => item.id === product.id);
    return item !== undefined;
  }

  // Add to compare
  public addToCompare(product: Product): Product | boolean {
    var item: Product | boolean = false;
    if (this.hasProduct(product)) {
      item = products.filter(item => item.id === product.id)[0];
      const index = products.indexOf(item);
    } else {
      if (products.length < 4)
        products.push(product);
      else
        this.toastrService.warning('Maximum 4 products are in compare.'); // toasr services
    }
    localStorage.setItem("compareItem", JSON.stringify(products));
    return item;
  }

  // Removed Product
  public removeFromCompare(product: Product) {
    if (product === undefined) { return; }
    const index = products.indexOf(product);
    products.splice(index, 1);
    localStorage.setItem("compareItem", JSON.stringify(products));
  }

  getCalendarList() {
    // this.mHttp.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {headers: new HttpHeaders({'Authorization':'Bearer ya29.Gls_BxF-gXvGwf7VUjiejdkymdQxB3n5U_K4yKpIaXb45_uIRNu9nsXXMkcw6WXSe7zW2ofKGX4p061CSW0tXNprTspG8muURLAx2BnwBgzZ7xOGnWt6dHvdLl8G'})}).toPromise().then(res => {
    //   console.log(res)
    // })
  }

  /*
  Navigation setup for left menu
  */

  async getMainCategoriesLeftMenu() {
    this.ShopDropDownMenu = []
    const query = await firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where("deleted", "==", false).get()
    query.forEach(async data => {
      const category = <MainCategory>data.data()
      try {
        const sub_cat = await this.getSubCategoriesByID(category.id)

        const dropdown_sub_menu: Menu[] = []

        sub_cat.forEach(sc => {
          const subc = <SubCategory>sc.data()
          let re = /\ /gi;
          const url_path_name = subc.name.toLowerCase().replace(re, '-')
          const scMenu: Menu = {
            path: `/home/collection/${url_path_name}`,
            title: subc.name,
            type: 'extLink'
          }
          dropdown_sub_menu.push(scMenu)
        })

        const sub_menu: Menu[] = [
          {
            title: category.name,
            type: 'link',
            children: dropdown_sub_menu
          }
        ]
        const main_menu: Menu = {
          title: category.name,
          type: 'sub',
          megaMenu: true,
          children: sub_menu
        }
        this.ShopDropDownMenu.push(main_menu)
        // console.log(this.ShopDropDownMenu)

        // console.log(JSON.stringify(this.ShopDropDownMenu))
      } catch (err) {
        console.log(err)
      }
    })
  }

  /*
    Navigation setup for left menu
  */
  async getMainCategoriesNavBar() {
    this.ShopDropDownMenu = []
    const sub_menu: navbar.Menu[] = []
    const query = await firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where("deleted", "==", false).get()
    var index = 0
    query.forEach(async data => {
      const category = <MainCategory>data.data()
      try {
        const sub_cat = await this.getSubCategoriesByID(category.id)

        const dropdown_sub_menu: navbar.Menu[] = []

        sub_cat.forEach(sc => {
          const subc = <SubCategory>sc.data()
          let re = /\ /gi;
          const url_path_name = subc.name.toLowerCase().replace(re, '-')
          const scMenu: navbar.Menu = {
            path: `/home/collection/${url_path_name}`,
            title: subc.name,
            type: 'extLink'
          }
          dropdown_sub_menu.push(scMenu)
        })
        
        const a_sub_menu: navbar.Menu = {
          title: category.name,
          type: 'link',
          children: dropdown_sub_menu
        }
        sub_menu.push(a_sub_menu)
        index = index + 1
        if(index == query.size){
          const main_menu: navbar.Menu = {
            title: 'shop',
            type: 'sub',
            megaMenu: true,
            megaMenuType: 'large',
            children: sub_menu
          }
          this.ShopDropDownMenu.push(main_menu)
          console.log(JSON.stringify(this.ShopDropDownMenu))
        }

      } catch (err) {
        console.log(err)
      }
    })
  }

  getSubCategoriesByID(main_id: string) {
    return firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).where("main_category_id", "==", main_id).get()
  }



}