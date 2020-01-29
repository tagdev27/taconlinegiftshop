import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/shared/services/products.service';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { SubCategory } from 'src/app/models/sub.category';

@Component({
  selector: 'app-slider-three',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderThreeComponent implements OnInit {

  

  constructor(public productsService: ProductsService) { }

  ngOnInit() {
  }

  slickInit(e){

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

  getMyStyles3() {
    let myStyles = {
      'background-image': `url(${this.productsService.banner.social_tree_image})`
    };
    return myStyles;
  }

  // Slick slider config
  public sliderConfig: any = {
    autoplay: true,
    autoplaySpeed: 3000
  };

}
