import { Component, OnInit } from '@angular/core';
import { MENUITEMS, Menu } from './left-menu-items';
import { MainCategory } from 'src/app/models/main.category';
import { SubCategory } from 'src/app/models/sub.category';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
declare var $: any;

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

  gotoCat(id:string){
    this.router.navigate([`/home/left-sidebar/collection/${id}`])
  }

  getMainCategories() {
    firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where("deleted", "==", false).get().then(query => {
      const subMenuItems: Menu[] = []
      var index = 0
      query.forEach(async data => {
        const category = <MainCategory>data.data()
        //this.main_categories.push(category)
        const sub_cat = await this.getSubCategoriesByID(category.id)
        const subItems: Menu[] = []
        sub_cat.forEach(sCat => {
          const sc = <SubCategory>sCat.data()
          const item: Menu = {
            path: `${sc.id}`,///home/left-sidebar/collection/
            title: sc.name,
            type: 'link'
          }
          subItems.push(item)
        })
        // console.log('=============subItems===============')
        // console.log(JSON.stringify(subItems))

        const main_item: Menu = {
          title: category.name,
          type: 'link',
          children: subItems
        }
        subMenuItems.push(main_item)

        // console.log('=============subMenuItems===============')
        // console.log(JSON.stringify(subMenuItems))

        index = index + 1
        const menu: Menu = {
          title: category.name,
          type: 'sub',
          path: 'all',
          megaMenu: true,
          children: subMenuItems
        }
        this.MENUITEMS.push(menu)
        // console.log('=============menu===============')
        // console.log(JSON.stringify(this.MENUITEMS))

        if(query.size == index){
          this.MENUITEMS.forEach(mi => {
            this.menuItems.push(mi)
          })
          // console.log('=============menuItems===============')
          // console.log(JSON.stringify(this.menuItems))
        }
      })
    });
  }

  getSubCategoriesByID(main_id: string) {
    return firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).where("main_category_id", "==", main_id).get()
  }

}
