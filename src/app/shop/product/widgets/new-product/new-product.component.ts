import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../../../../shared/classes/product';
import { ProductsService } from '../../../../shared/services/products.service';
import { AppConfig } from 'src/app/services/global.service';

@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.scss']
})
export class NewProductComponent implements OnInit {
  
  public products : Product[] = [];	
config:AppConfig
  constructor(private productsService: ProductsService) { 
    this.config = new AppConfig(productsService)
  }

  ngOnInit() {
  	this.productsService.getProducts().subscribe(product => this.products = product);
  }

}
