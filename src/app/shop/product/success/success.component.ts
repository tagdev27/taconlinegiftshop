import { Component, OnInit } from '@angular/core';
import { Order } from '../../../shared/classes/order';
import { OrderService } from '../../../shared/services/order.service';
import { ProductsService } from 'src/app/shared/services/products.service';
import { AppConfig } from 'src/app/services/global.service';

@Component({
  selector: 'app-order-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  
  public orderDetails : Order = {};
  config:AppConfig
  constructor(private orderService: OrderService, private productsService:ProductsService) { 
    this.config = new AppConfig(productsService)
  }

  date = new Date()
  months = ["January","Febuary","March","April","May","June","July","August","September","October","November","December"]

  getDateNow() {
    return `${this.months[this.date.getUTCMonth()]} ${this.date.getUTCDate()}, ${this.date.getUTCFullYear()}`
  }

  ngOnInit() {
  	this.orderDetails = this.orderService.getOrderItems();
  }

}
