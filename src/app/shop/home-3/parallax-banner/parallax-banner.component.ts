import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/shared/services/products.service';

@Component({
  selector: 'app-parallax-banner-three',
  templateUrl: './parallax-banner.component.html',
  styleUrls: ['./parallax-banner.component.scss']
})
export class ParallaxBannerThreeComponent implements OnInit {

  constructor(private productsService: ProductsService) { }

  ngOnInit() {
  }

  getMyStyles() {
    let myStyles = {
      'background-image': `url(${this.productsService.banner.parallax_banner_image})`
    };
    return myStyles;
  }

}
