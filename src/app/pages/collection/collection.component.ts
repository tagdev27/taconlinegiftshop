import { Component, OnInit } from '@angular/core';
import * as firebase from "firebase";
import { SubCategory } from 'src/app/models/sub.category';

declare interface Collections {
  id:string
  name:string
  image:string
  link:string
  number_of_products:number
}

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  constructor() { }

  collections:Collections[] = []

  ngOnInit() {
    firebase.firestore().collection('db').doc('tacadmin').collection('main-categories').where('deleted','==',false).get().then(query => {
      this.collections = []
      query.forEach(async col => {
        const data = col.data()
        const subCat = await this.getNumberOfProductsByCategoryID(data['id'])
        const mCollection:Collections = {
          id: subCat.id,
          name: data['name'],
          image: data['image'],
          link: `https://tacgifts.com/home/collection/${subCat.id}`,
          number_of_products: 0
        }
      })
    })
  }

  async getNumberOfProductsByCategoryID(main_cat_id:string){
    const query = await firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where('main_category_id','==',main_cat_id).get()
    return <SubCategory>query.docs[0].data()
  }

}
