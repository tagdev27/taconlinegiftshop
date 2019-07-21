import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from '../../../../shared/classes/product';
import { ProductsService } from '../../../../shared/services/products.service';
import * as $ from 'jquery'
//declare var $: any;
import { AppConfig } from 'src/app/services/global.service';

@Component({
  selector: 'app-modal-cart',
  templateUrl: './modal-cart.component.html',
  styleUrls: ['./modal-cart.component.scss']
})
export class ModalCartComponent implements OnInit, OnDestroy {

  public products: Product[] = [];
  config: AppConfig
  constructor(private productsService: ProductsService, ) {
    this.config = new AppConfig(productsService)
  }

  ngOnInit() {
    this.productsService.getProducts().subscribe(product => {
      this.products = product;
    });
  }

  ngOnDestroy() {
    //$('.addTocartModal').modal('hide');
    $('.addTocartModal').hide("fast");
  }

  relatedProducts(pro) {
    var relatedItems = this.products.filter(function (products) {
      if (products.id != pro.id)
        return products.category.includes(pro.category);
    });
    return relatedItems;
  }

}
