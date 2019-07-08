import { Component, OnInit } from '@angular/core';
import { MENUITEMS } from './left-menu-items';
import { MainCategory } from 'src/app/models/main.category';
import { SubCategory } from 'src/app/models/sub.category';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import 'jquery'
import 'smartmenus'
declare var $: any;

export interface Menu {
  path?: string;
  title?: string;
  type?: string;
  megaMenu?: boolean;
  children?: Menu[];
}

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

  constructor(private router: Router) { }

  ngOnInit() {
    //this.menuItems = MENUITEMS.filter(menuItem => menuItem);
    this.getMainCategories()
  }

  gotoCat(id: string) {
    this.router.navigate([`/home/left-sidebar/collection/${id}`])
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
              path: `${sc.id}`,///home/left-sidebar/collection/
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
        //     path: '/home/left-sidebar/collection/all'
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
          console.log(JSON.stringify(this.menuItems))
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
