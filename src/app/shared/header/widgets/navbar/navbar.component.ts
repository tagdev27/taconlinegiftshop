import { Component, OnInit } from '@angular/core';
import { AMENUITEMS } from './navbar-items';
// import { Router, ActivatedRoute } from "@angular/router";
declare var $: any;
import 'jquery';
import 'smartmenus';
import * as firebase from "firebase/app";
import 'firebase/firestore'
import { MainCategory } from 'src/app/models/main.category';
import { SubCategory } from 'src/app/models/sub.category';
// import { NavBarMenu } from 'src/app/models/navbar.menu';
import { StoreService } from 'src/app/services/store.settings';
import { ProductsService } from 'src/app/shared/services/products.service';

export interface Menu {
  path?: string;
  title?: string;
  type?: string;
  megaMenu?: boolean;
  megaMenuType?: string; // small, medium, large
  image?: string;
  children?: Menu[];
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  public menuItems: Menu[] = [];
  main_categories: MainCategory[] = []
  sub_categories: SubCategory[] = []

  MENUITEMS: Menu[] = []

  constructor(private productService:ProductsService) { }

  service = new StoreService()
  number = ''
  ngOnInit() {
    this.service.getSettings().then(store => {
      this.number = store.number
    })
    // const initMenu: Menu[] = [
    //   {
    //     type: 'link',
    //     title: 'home',
    //     path: '/home'
    //   },
    //   {
    //     type: 'link',
    //     title: 'social tree',
    //     path: '/social-tree'
    //   },
    //   {
    //     type: 'link',
    //     title: 'about us',
    //     path: '/404'
    //   },
    //   {
    //     type: 'link',
    //     title: 'contact',
    //     path: '/404'
    //   }
    // ]
    // initMenu.forEach(item => {
    //   this.MENUITEMS.push(item)
    // })
    //this.menuItems = this.MENUITEMS.filter(menuItem => menuItem);

    //this.getMainCategories()
    
    this.menuItems = AMENUITEMS.filter(menuItem => menuItem);
    //this.menuItems = this.productService.ShopDropDownMenu.filter(menuItem => menuItem)
  }

  getMainCategories() {
    firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where("deleted", "==", false).get().then(query => {
      const subMenuItems:Menu[] = []
      var index = 0
      query.forEach(async data => {
        const category = <MainCategory>data.data()
        //this.main_categories.push(category)
        const sub_cat = await this.getSubCategoriesByID(category.id)
        const subItems: Menu[] = []
        sub_cat.forEach(sCat => {
          const sc = <SubCategory>sCat.data()
          const item: Menu = {
            path: `/home/collection/${sc.id}`,
            title: sc.name,
            type: 'link'
          }
          subItems.push(item)
        })
        //console.log('=============subItems===============')
        console.log(JSON.stringify(subItems))
        
        const main_item: Menu = {
          title: category.name,
          type: 'link',
          children: subItems
        }
        subMenuItems.push(main_item)

        //console.log('=============subMenuItems===============')
        console.log(JSON.stringify(subMenuItems))

        index = index + 1
        if(query.size == index){
          const menu: Menu = {
            title: 'shop',
            type: 'sub',
            megaMenu: true,
            megaMenuType: 'large',
            children: subMenuItems
          }
          this.MENUITEMS.push(menu)
          this.menuItems = this.MENUITEMS.filter(menuItem => menuItem);
          $('#sub-menu').smartmenus('refresh');
          //console.log('=============menu===============')
          //console.log(JSON.stringify(this.MENUITEMS))
        }
      })
    });
  }

  getSubCategoriesByID(main_id: string) {
    return firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).where("main_category_id", "==", main_id).get()
  }

  // this.sub_categories = []
  //     var index = 0
  //     query.forEach(data => {
  //       const category = <SubCategory>data.data()
  //       this.sub_categories.push(category)
  //     })

}
