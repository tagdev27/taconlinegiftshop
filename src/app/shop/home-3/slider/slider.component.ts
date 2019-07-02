import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/shared/services/products.service';

@Component({
  selector: 'app-slider-three',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderThreeComponent implements OnInit {

  constructor(private productsService: ProductsService) { }

  ngOnInit() {
  }

  getMyStyles1() {
    let myStyles = {
      'background-image': `url(${this.productsService.banner.slider1_image})`
    };
    return myStyles;
  }

  getMyStyles2() {
    let myStyles = {
      'background-image': `url(${this.productsService.banner.slider2_image})`
    };
    return myStyles;
  }

  // Slick slider config
  public sliderConfig: any = {
    autoplay: true,
    autoplaySpeed: 3000
  };

}
