import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/shared/services/products.service';

@Component({
  selector: 'app-collection-banner-three',
  templateUrl: './collection-banner.component.html',
  styleUrls: ['./collection-banner.component.scss']
})
export class CollectionBannerThreeComponent implements OnInit {

  constructor(public productsService: ProductsService) { }

  ngOnInit() {
  }

}
