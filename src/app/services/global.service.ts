import swal from "sweetalert2";
import * as firebase from "firebase";
import { ProductsService } from "../shared/services/products.service";
import { Observable } from "rxjs";
import { Banners } from "../models/banner";

export class AppConfig {

  constructor(public productsService?: ProductsService) { }
  //constructor(){}

  displayMessage(msg: string, success: boolean) {
    swal({
      title: msg,
      buttonsStyling: false,
      confirmButtonClass: (!success) ? "btn btn-danger" : "btn btn-success"
    }).catch(swal.noop)
  }

  logActivity(message: string) {
    const key = firebase.database().ref().push().key
    firebase.firestore().collection('db').doc('tacadmin').collection('logs').doc(key).set({
      'id': key,
      'log': message,
      'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
    })
  }

  convertPrice(price: number) {
    //console.log(`price  ===============  ${price}`)
    const currency = this.productsService.currency
    //console.log(`currency  ===============  ${currency}`)
    if (currency == '₦') {
      return price
    } else {
      //console.log(`length of currencies  ===============  ${this.productsService.currencies.length}`)
      const getSelectedCurrency = this.productsService.currencies.filter((item, index, arr) => {
        return item.name == currency
      })
      //console.log(`exchange rate  ===============  ${getSelectedCurrency[0].exchange_rate}`)
      const fixed_amount = (price / Number(getSelectedCurrency[0].exchange_rate)).toFixed(2)
      return Number(fixed_amount)
    }
  }

  convertTotalPrice(price: Observable<number>): Observable<number> {
    //console.log(`price  ===============  ${price}`)
    const currency = this.productsService.currency
    //console.log(`currency  ===============  ${currency}`)
    if (currency == '₦') {
      return price
    } else {
      //console.log(`length of currencies  ===============  ${this.productsService.currencies.length}`)
      const getSelectedCurrency = this.productsService.currencies.filter((item, index, arr) => {
        return item.name == currency
      })
      //console.log(`exchange rate  ===============  ${getSelectedCurrency[0].exchange_rate}`)
      return price.map(pr => {
        const fixed_amount = (pr / Number(getSelectedCurrency[0].exchange_rate)).toFixed(2)
        return Number(fixed_amount)
      })
    }
  }

  async getBanners() {
    const b = await firebase.firestore().collection('db').doc('tacadmin').collection('settings').doc('banners').get()
    return <Banners>b.data()
  }
}