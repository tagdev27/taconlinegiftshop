import { Component, OnInit } from '@angular/core';
import { Product } from '../../shared/classes/product';
import { ProductsService } from '../../shared/services/products.service';
import * as $ from 'jquery'

@Component({
  selector: 'app-home-three',
  templateUrl: './home-three.component.html',
  styleUrls: ['./home-three.component.scss']
})
export class HomeThreeComponent implements OnInit {

  public products: Product[] = [];
  
  constructor(private productsService: ProductsService) {   }

  ngOnInit() {
    this.productsService.getProducts().subscribe(product => this.products = product);
    $('#fc_frame, #fc_frame.fc-widget-normal').css("bottom","35px").css("right","0px")
  }

}
