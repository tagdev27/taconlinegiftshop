import { Component, OnInit } from '@angular/core';
import { Product } from '../../../../classes/product';
import { WishlistService } from '../../../../services/wishlist.service';
import { ProductsService } from '../../../../../shared/services/products.service';
import { Observable, of } from 'rxjs';
import { StoreService } from "../../../../../services/store.settings";

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar-one.component.html',
  styleUrls: ['./topbar-one.component.scss']
})
export class TopbarOneComponent implements OnInit {

  constructor(public productsService: ProductsService) { }

  service = new StoreService()
  number = ''

  ngOnInit() {
    this.service.getSettings().then(store => {
      this.number = store.number
    })
  }

}
