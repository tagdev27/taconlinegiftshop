import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../../../shared/classes/product';
import { ProductsService } from '../../../shared/services/products.service';
import * as $ from 'jquery';
import { AppConfig } from "src/app/services/global.service";

@Component({
  selector: 'app-vertical-sliders',
  templateUrl: './vertical-sliders.component.html',
  styleUrls: ['./vertical-sliders.component.scss']
})
export class VerticalSlidersComponent implements OnInit {
  
  @Input() products: Product;

  config:AppConfig
  
  constructor(public productsService: ProductsService) { 
    this.config = new AppConfig(productsService)
  }

  ngOnInit() {
  }

  slickInit(e){
    
  }

  // convertPrice(price: number){
  //   //console.log(`price  ===============  ${price}`)
  //   const currency = this.productsService.currency
  //   //console.log(`currency  ===============  ${currency}`)
  //   if(currency == '₦'){
  //     return price
  //   }else {
  //     //console.log(`length of currencies  ===============  ${this.productsService.currencies.length}`)
  //     const getSelectedCurrency = this.productsService.currencies.filter((item, index, arr) =>{
  //       return item.name == currency
  //     })
  //     //console.log(`exchange rate  ===============  ${getSelectedCurrency[0].exchange_rate}`)
  //     return price / Number(getSelectedCurrency[0].exchange_rate)
  //   }
  // }

}
