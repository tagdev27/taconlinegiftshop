import { Component, OnInit } from '@angular/core';
import * as firebase from "firebase/app";
import 'firebase/firestore'
import { SubCategory } from 'src/app/models/sub.category';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from 'src/app/shared/services/products.service';
import { MainCategory } from 'src/app/models/main.category';

declare interface Collections {
  //id:string
  name: string
  desc:string
  image: string
  link: string
  //number_of_products:number
}

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  collections: Collections[] = []
  loading = true

  constructor(private route: ActivatedRoute, public productsService: ProductsService) {
    // console.log('constructor')
    this.route.params.subscribe(params => {
      // console.log(params)
      const category = params['id']
      // console.log(category)
      this.getSubCategoriesFromMainCategoryID(category)
    })
  }

  ngOnInit() {
    // console.log('here')
    // firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where('deleted','==',false).get().then(query => {
    //   this.collections = []
    //   query.forEach(async col => {
    //     const data = col.data()
    //     const subCat = await this.getNumberOfProductsByCategoryID(data['id'])
    //     const mCollection:Collections = {
    //       id: subCat.id,
    //       name: data['name'],
    //       image: data['image'],
    //       link: `https://tacgifts.com/home/collection/${subCat.id}`,
    //       number_of_products: 0
    //     }
    //   })
    // })
  }

  getSubCategoriesFromMainCategoryID(category: string) {
    if (category == null) {
      this.getAllSubCategories()
    } else {
      this.getSubCategoriesByID(category)
    }
  }

  async getSubCategoriesByID(cat: string) {
    const get_main_cat_id = await firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where('link', '==', cat).get()
    if(get_main_cat_id == null){
      this.getAllSubCategories()
      return
    }
    const main_cat_id = <MainCategory>get_main_cat_id.docs[0].data()
    const query = await firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where('main_category_id', '==', main_cat_id.id).get()
    this.collections = []
    query.forEach(sub => {
      const s = <SubCategory>sub.data()
      const mCollection: Collections = {
        name: s.name,
        desc: s.description,
        image: s.image,
        link: `/home/collection/${s.link}`,
      }
      this.collections.push(mCollection)
    })
    this.loading = false
  }

  async getAllSubCategories() {
    const query = await firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where('deleted', '==', false).get()
    this.collections = []
    query.forEach(sub => {
      const s = <SubCategory>sub.data()
      const mCollection: Collections = {
        name: s.name,
        desc: s.description,
        image: s.image,
        link: `/home/collection/${s.link}`,//https://tacgifts.com
      }
      this.collections.push(mCollection)
    })
    this.loading = false
  }

  async getNumberOfProductsByCategoryID(main_cat_id: string) {
    const query = await firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where('main_category_id', '==', main_cat_id).get()
    return <SubCategory>query.docs[0].data()
  }

}
