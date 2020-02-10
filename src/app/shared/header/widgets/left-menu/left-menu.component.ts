import { Component, OnInit } from '@angular/core';
import { MENUITEMS, Menu } from './left-menu-items';
import { MainCategory } from 'src/app/models/main.category';
import { SubCategory } from 'src/app/models/sub.category';
import * as firebase from "firebase/app";
import 'firebase/firestore'
import { Router } from '@angular/router';
import 'jquery';
import 'smartmenus';
import { ProductsService } from 'src/app/shared/services/products.service';
declare var $: any;

// export interface Menu {
//   path?: string;
//   title?: string;
//   type?: string;
//   megaMenu?: boolean;
//   children?: Menu[];
// }

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit {

  public menuItems: Menu[] = [];
  MENUITEMS: Menu[] = [];
  main_categories: MainCategory[] = []
  sub_categories: SubCategory[] = []

  ShopDropDownMenu:Menu[] = []

  constructor(private router: Router, private productService:ProductsService) { }

  async ngOnInit() {
    // console.log(this.productService.ShopDropDownMenu)
    this.menuItems = MENUITEMS.filter(menuItem => menuItem);
    //this.menuItems = this.productService.ShopDropDownMenu.filter(menuItem => menuItem)
    //this.getMainCategories()

    // await this.getMainCategoriesLeftMenu()
    // console.log('Im done now....')
  }

  /*
  Navigation setup for left menu
  */

 async getMainCategoriesLeftMenu() {
  this.ShopDropDownMenu = []
  const query = await firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where("deleted", "==", false).get()
  var index = 0
  query.forEach(async data => {
    const category = <MainCategory>data.data()
    try {
      const sub_cat = await this.getSubCategoriesByID(category.id)

      const dropdown_sub_menu: Menu[] = []

      sub_cat.forEach(sc => {
        const subc = <SubCategory>sc.data()
        let re = /\ /gi;
        const url_path_name = subc.name.toLowerCase().replace(re, '-')
        const scMenu: Menu = {
          path: `/home/collection/${url_path_name}`,
          title: subc.name,
          type: 'extLink'
        }
        dropdown_sub_menu.push(scMenu)
      })

      const sub_menu: Menu[] = [
        {
          title: category.name,
          type: 'link',
          children: dropdown_sub_menu
        }
      ]
      const main_menu: Menu = {
        title: category.name,
        type: 'sub',
        megaMenu: true,
        children: sub_menu
      }
      index = index + 1
      this.ShopDropDownMenu.push(main_menu)
      console.log(this.ShopDropDownMenu)

      if(index == query.size){
        this.menuItems = this.ShopDropDownMenu.filter(menuItem => menuItem);
        $('#sub-menu').smartmenus('refresh');
      }

      // console.log(JSON.stringify(this.ShopDropDownMenu))
    } catch (err) {
      console.log(err)
    }
  })
}

  gotoCat(id: string) {
    this.router.navigate([`/home/collection/${id}`])
  }

  getMainCategories() {
    firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where("deleted", "==", false).get().then(query => {
      const subMenuItems: Menu[] = []
      var index = 0
      //console.log(`query == ${query.size}`)
      query.forEach(async data => {
        const category = <MainCategory>data.data()
        //this.main_categories.push(category)
        const subItems: Menu[] = []
        const sub_cat = await this.getSubCategoriesByID(category.id)
        if (sub_cat.size > 0) {
          sub_cat.forEach(sCat => {
            //console.log(`sub_cat == ${sub_cat.size}`)
            const sc = <SubCategory>sCat.data()
            const item: Menu = {
              path: `${sc.id}`,///home/collection/
              title: sc.name,
              type: 'link'
            }
            subItems.push(item)
          })
          const main_item: Menu = {
            title: category.name,
            type: 'link',
            children: subItems
          }
          subMenuItems.push(main_item)
        } 
        // else {
        //   const main_item: Menu = {
        //     title: category.name,
        //     type: 'link',
        //     path: '/home/collection/all'
        //   }
        //   subMenuItems.push(main_item)
        // }

        // console.log('=============subItems===============')
        // console.log(JSON.stringify(subItems))



        // console.log('=============subMenuItems===============')
        // console.log(JSON.stringify(subMenuItems))

        index = index + 1
        if (sub_cat.size > 0) {
          const menu: Menu = {
            title: category.name,
            type: 'sub',
            path: 'all',
            megaMenu: true,
            children: subMenuItems
          }
          this.MENUITEMS.push(menu)
        } else {
          const menu: Menu = {
            title: category.name,
            type: 'link',
            path: 'all',
          }
          this.MENUITEMS.push(menu)
        }

        // console.log('=============menu===============')
        // console.log(JSON.stringify(this.MENUITEMS))

        if (query.size == index) {
          // this.MENUITEMS.forEach(mi => {
          //   this.menuItems.push(mi)
          // })
          this.menuItems = this.MENUITEMS.filter(menuItem => menuItem);
          $('#sub-menu').smartmenus('refresh');
          //console.log(JSON.stringify(this.menuItems))
        }
      })

    });
  }

  getSubCategoriesByID(main_id: string) {
    return firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).where("main_category_id", "==", main_id).get()
  }

  trackMenu(index, menu) {
    //console.log(style);
    return menu ? menu.id : undefined;

  }

}
