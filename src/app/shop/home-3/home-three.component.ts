import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Product } from '../../shared/classes/product';
import { ProductsService } from '../../shared/services/products.service';
import * as $ from 'jquery'
// import * as firebase from "firebase/app"
// import "firebase/database"

@Component({
  selector: 'app-home-three',
  templateUrl: './home-three.component.html',
  styleUrls: ['./home-three.component.scss']
})
export class HomeThreeComponent implements OnInit, AfterViewInit {

  ngAfterViewInit(): void {
    //this.recordWebsiteVisits()
  }

  public products: Product[] = [];

  constructor(private productsService: ProductsService) { }

  ngOnInit() {
    this.productsService.getProducts().subscribe(product => this.products = product);
    $('#fc_frame, #fc_frame.fc-widget-normal').css("bottom", "35px").css("right", "0px")
  }

  //   recordWebsiteVisits() {
  //     const date = new Date()
  //     const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  //     const year = date.getUTCFullYear()
  //     const month = months[date.getUTCMonth()]
  //     const day = date.getUTCDate()

  //     const firebase_ref = firebase.database().ref("website-views").child(`${year}`).child(month).child(`${day}`)
  //     firebase_ref.child("metric").once('value', snap => {
  //        if (snap.exists()) {
  //           const current_metric: number = snap.val()
  //           firebase_ref.update({ 'metric': current_metric + 1 })
  //        } else {
  //           firebase_ref.update({ 'metric': 1 })
  //        }
  //     })
  //  }


}
