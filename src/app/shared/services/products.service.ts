import { Injectable, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../classes/product';
import { BehaviorSubject, Observable, of, Subscriber } from 'rxjs';
import { map, filter, scan, count } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import * as firebase from "firebase";
import { Currency } from 'src/app/models/currency';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as cors from "cors";
import { Banners } from 'src/app/models/banner';
import { AppConfig } from 'src/app/services/global.service';

// Get product from Localstorage
let products = JSON.parse(localStorage.getItem("compareItem")) || [];

@Injectable()

export class ProductsService {

  public currencies: Currency[] = []
  public banner:Banners={}
  public user_country = {}
  public country = ''
  //public currency : string = 'USD';
  public currency: string = '₦';
  public exchange_rate: number = 0;
  public catalogMode: boolean = false;

  public compareProducts: BehaviorSubject<Product[]> = new BehaviorSubject([]);
  public observer: Subscriber<{}>;

  FProducts: Product[] = []

  // Initialize 
  constructor(private http: Http, private toastrService: ToastrService, private mHttp: HttpClient) {
    this.compareProducts.subscribe(products => products = products);
    new AppConfig().getBanners().then(ban => {
      //console.log(ban)
      this.banner = ban
    })
    // const hd = new Headers()
    // hd.set("", "")
    this.mHttp.get('https://ipapi.co/json', {headers: new HttpHeaders(this.apiHeaderDict)}).subscribe(res => {//https://us-central1-taconlinegiftshop.cloudfunctions.net/get_current_ip   { headers: new HttpHeaders(this.headerDict) }
      this.country = res['country_name']
      this.user_country = { latitude: res['latitude'], longitude: res['longitude'] }
      //const country = res['country']
      //console.log(`country == ${country}`)
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
              this.currency = '₦'
            }
          }
        } else {
          this.currency = '₦'
        }
        //console.log(`country == ${this.currency}`)
      });
    })
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
    return this.mHttp.get("https://us-central1-taconlinegiftshop.cloudfunctions.net/get_all_products?action=get", { headers: new HttpHeaders({ 'Authorization': 'api ATCNoQUGOoEvTwqWigCR' }) }).map((res: any) => res)
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

}