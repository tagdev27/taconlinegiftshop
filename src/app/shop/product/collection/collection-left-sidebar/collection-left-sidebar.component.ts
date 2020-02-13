import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate } from "@angular/animations";
import { Product, ColorFilter, TagFilter } from '../../../../shared/classes/product';
import { ProductsService } from '../../../../shared/services/products.service';
import * as _ from 'lodash'
import * as $ from 'jquery';
import { AppConfig } from 'src/app/services/global.service';
import * as firebase from "firebase/app";
import 'firebase/firestore'
import 'firebase/analytics';
import { SubCategory } from 'src/app/models/sub.category';

export interface SubCategoryInit {
  id:string
  name:string
}

@Component({
  selector: 'app-collection-left-sidebar',
  templateUrl: './collection-left-sidebar.component.html',
  styleUrls: ['./collection-left-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [  // angular animation
    trigger('Animation', [
      transition('* => fadeOut', [
        style({ opacity: 0.1 }),
        animate(1000, style({ opacity: 0.1 }))
      ]),
      transition('* => fadeIn', [
        style({ opacity: 0.1 }),
        animate(1000, style({ opacity: 0.1 }))
      ])
    ])
  ]
})
export class CollectionLeftSidebarComponent implements OnInit {

  public products: Product[] = [];
  public items: Product[] = [];
  public allItems: Product[] = [];
  public colorFilters: ColorFilter[] = [];
  public tagsFilters: any[] = [];
  public tags: any[] = [];
  public colors: any[] = [];
  public sortByOrder: string = '';   // sorting
  public animation: any;   // Animation

  lastKey = ''      // key to offset next query from
  finished = false  // boolean when end of data is reached
  config: AppConfig
  sub_category_id = ''
  col_image = ''
  col_title = ''
  col_sub_title = ''

  preloading = true
  display_empty = false

  init_sub_cats:SubCategoryInit[] = []

  constructor(private route: ActivatedRoute, private router: Router,
    public productsService: ProductsService) {
    this.config = new AppConfig(productsService)
    this.route.params.subscribe(async params => {
      const category = params['category'];
      this.sub_category_id = category
      //await this.getAllSubCategories()
      var selected_category = category
      if(selected_category != 'all'){
        const sc = await this.getSubCategoryIdByName()
        if(sc == null){
          this.preloading = false
          this.display_empty = true
          return
        }
        selected_category = sc.id
      }else {
        this.preloading = false
      }
      // const getSubCat = (category == 'all') ? 'all' : this.getSubCategoryIDByName()
      this.productsService.getProductByCategory(selected_category).subscribe(products => {
        if(products.length == 0){
          this.display_empty = true
        }
        this.allItems = products  // all products
        this.products = products.slice(0, 8)
        this.getTags(products)
        this.getColors(products)
      })
      if (this.sub_category_id != 'all') {
        // const id = this.getSubCategoryIDByName()
        //firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where('name', '==', name).get().then(snap => {
        firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').doc(selected_category).get().then(snap => {
          this.preloading = false
          const subCat = <SubCategory>snap.data()
          // console.log(`hello here = ${subCat.description}`)
          this.col_image = subCat.image
          this.col_title = ` - ${subCat.name}`
          this.col_sub_title = subCat.description
          $('head').append(`<meta name="description" content="${subCat.description}">`)
          firebase.analytics().logEvent('collection_views', { name: `${subCat.name}`, platform : 'web'});
        })
      }
    });
  }

  ngOnInit() {
    
  }

  async getSubCategoryIdByName() {
    const query = await firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where('link', '==', this.sub_category_id).get()
    if(query.size > 0){
      return <SubCategory>query.docs[0].data()
    }
    return null
  }

  /* Not Used Function For Now */
  async getAllSubCategories() {
    const query = await firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').get()
    this.init_sub_cats = []
    query.forEach(data => {
      const sc = <SubCategory>data.data()
      const in_sc:SubCategoryInit = {
        id: sc.id,
        name: sc.name.toLowerCase()
      }
      this.init_sub_cats.push(in_sc)
    })
  }

  // getSubCategoryIDByName() {
  //   let re = /\-/gi;
  //   const name = this.sub_category_id.replace(re, ' ')
  //   const search_result = this.init_sub_cats.filter((val, ind, arr) => {
  //     return val.name == name
  //   })
  //   return search_result[0].id
  // }

  // Get current product tags
  public getTags(products) {
    var uniqueBrands = []
    var itemBrand = Array();
    products.map((product, index) => {
      if (product.tags) {
        product.tags.map((tag) => {
          const index = uniqueBrands.indexOf(tag.value);
          if (index === -1) uniqueBrands.push(tag.value);
        })
      }
    });
    for (var i = 0; i < uniqueBrands.length; i++) {
      itemBrand.push({ brand: uniqueBrands[i] })
    }
    this.tags = itemBrand
  }

  // Get current product colors
  public getColors(products) {
    var uniqueColors = []
    var itemColor = Array();
    products.map((product, index) => {
      if (product.colors) {
        product.colors.map((color) => {
          const index = uniqueColors.indexOf(color);
          if (index === -1) uniqueColors.push(color);
        })
      }
    });
    for (var i = 0; i < uniqueColors.length; i++) {
      itemColor.push({ color: uniqueColors[i] })
    }
    this.colors = itemColor
  }


  // Animation Effect fadeIn
  public fadeIn() {
    this.animation = 'fadeIn';
  }

  // Animation Effect fadeOut
  public fadeOut() {
    this.animation = 'fadeOut';
    // this.filterItems().length
  }


  // Initialize filetr Items
  public filterItems(): Product[] {
    return this.items.filter((item: Product) => {
      const Colors: boolean = this.colorFilters.reduce((prev, curr) => { // Match Color
        if (item.colors) {
          if (item.colors.includes(curr.color)) {
            return prev && true;
          }
        }
      }, true);
      const Tags: boolean = this.tagsFilters.reduce((prev, curr) => { // Match Tags
        if (item.tags) {
          if (item.tags.includes(curr)) {
            return prev && true;
          }
        }
      }, true);
      return Colors && Tags; // return true
    });
  }

  // Update tags filter
  public updateTagFilters(tags: any[]) {
    this.tagsFilters = tags;
    this.animation == 'fadeOut' ? this.fadeIn() : this.fadeOut(); // animation
  }

  // Update color filter
  public updateColorFilters(colors: ColorFilter[]) {
    this.colorFilters = colors;
    this.animation == 'fadeOut' ? this.fadeIn() : this.fadeOut(); // animation
  }

  // Update price filter
  public updatePriceFilters(price: any) {
    let items: any[] = [];
    this.products.filter((item: Product) => {
      if (item.price >= price[0] && item.price <= price[1]) {
        items.push(item); // push in array
      }
    });
    this.items = items;
  }

  public twoCol() {
    if ($('.product-wrapper-grid').hasClass("list-view")) { } else {
      $(".product-wrapper-grid").children().children().children().removeClass();
      $(".product-wrapper-grid").children().children().children().addClass("col-lg-6");
    }
  }

  public threeCol() {
    if ($('.product-wrapper-grid').hasClass("list-view")) { } else {
      $(".product-wrapper-grid").children().children().children().removeClass();
      $(".product-wrapper-grid").children().children().children().addClass("col-lg-4");
    }
  }

  public fourCol() {
    if ($('.product-wrapper-grid').hasClass("list-view")) { } else {
      $(".product-wrapper-grid").children().children().children().removeClass();
      $(".product-wrapper-grid").children().children().children().addClass("col-lg-3");
    }
  }

  public sixCol() {
    if ($('.product-wrapper-grid').hasClass("list-view")) { } else {
      $(".product-wrapper-grid").children().children().children().removeClass();
      $(".product-wrapper-grid").children().children().children().addClass("col-lg-2");
    }
  }

  // For mobile filter view
  public mobileFilter() {
    $('.collection-filter').css("left", "-15px");
  }

  // Infinite scroll
  public onScroll() {
    this.lastKey = _.last(this.allItems)['id'];
    if (this.lastKey != _.last(this.items)['id']) {
      this.finished = false
    }
    // If data is identical, stop making queries
    if (this.lastKey == _.last(this.items)['id']) {
      this.finished = true
    }
    if (this.products.length < this.allItems.length) {
      let len = this.products.length;
      for (var i = len; i < len + 4; i++) {
        if (this.allItems[i] == undefined) return true
        this.products.push(this.allItems[i]);
      }
    }
  }

  // sorting type ASC / DESC / A-Z / Z-A etc.
  public onChangeSorting(val) {
    this.sortByOrder = val;
    this.animation == 'fadeOut' ? this.fadeIn() : this.fadeOut(); // animation
  }

}
