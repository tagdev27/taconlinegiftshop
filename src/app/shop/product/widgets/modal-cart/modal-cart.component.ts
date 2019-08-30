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
    //$('').remove()
    $('.addTocartModal').hide("fast");
  }

  relatedProducts(pro) {
    var relatedItems = this.products.filter(function (products) {
      if (products.id != pro.id){
        //console.log(`hey ============ ${pro.category}`)
        var cs:string[] = `${pro.category}`.split(',')
        //console.log(`hello ============ ${cs[0]}`)
        return products.category.includes(cs[0]);
      }
    });
    return relatedItems;
  }

}
