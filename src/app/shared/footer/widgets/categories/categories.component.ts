import { Component, OnInit } from '@angular/core';
import { SubCategory } from 'src/app/models/sub.category';
import * as firebase from 'firebase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  constructor(private router:Router) { }
  sub_categories: SubCategory[] = []

  ngOnInit() {
    this.getSubCategories()
  }

  getSubCategories() {
    firebase.firestore().collection('db').doc('tacadmin').collection('sub-categories').where("deleted", "==", false).limit(5).onSnapshot(query => {
      this.sub_categories = []
      query.forEach(data => {
        const category = <SubCategory>data.data()
        // const c:Cat = {
        //   url: `/home/left-sidebar/collection/${category.id}`,
        //   name: category.name
        // }
        this.sub_categories.push(category)
      })
    });
  }

  gotocat(id:string){
    location.href = `/home/left-sidebar/collection/${id}`
  }

}
